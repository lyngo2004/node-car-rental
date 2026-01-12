
const {
    extractTimeFromSQL,
    combineSQLDateTime,
    buildDateObject,
    isOverlapWithBuffer
} = require("../utils/datetimeUtils");
const {
    ACTIVE_RENTAL_STATUSES,
    DERIVED_RENTAL_STATUSES,
} = require("../constants/rentalStatus");
const { Op, Transaction } = require("sequelize");
const { sequelize } = require("../config/Sequelize");
const Rental = require("../models/Rental");
const Payment = require("../models/Payment");
const Customer = require("../models/Customer");
const Car = require("../models/Car");
const Employee = require("../models/Employee");

const checkoutRentalService = async (userId, payload) => {
    try {

        // --- NHÓM 2: VALIDATE INPUT ---
        if (
            !payload.CarId ||
            !payload.pickupLocation ||
            !payload.pickupDate ||
            !payload.pickupTime ||
            !payload.dropoffLocation ||
            !payload.dropoffDate ||
            !payload.dropoffTime ||
            !payload.billing ||
            !payload.billing.fullName ||
            !payload.billing.phone ||
            !payload.billing.address ||
            !payload.billing.driverLicense ||
            !payload.paymentMethod
        ) {
            return { EC: 1, EM: "Missing required fields", DT: null };
        }

        // --- NHÓM 3: LOAD CUSTOMER ---
        const Customer = require("../models/Customer");
        const customer = await Customer.findOne({
            where: { UserId: userId }
        });

        if (!customer) {
            return {
                EC: 1,
                EM: "Customer not found",
                DT: null
            };
        }

        // Update only missing fields
        let needUpdate = false;

        if (!customer.FullName) {
            customer.FullName = payload.billing.fullName;
            needUpdate = true;
        }

        if (!customer.Phone) {
            customer.Phone = payload.billing.phone;
            needUpdate = true;
        }

        if (!customer.Address) {
            customer.Address = payload.billing.address;
            needUpdate = true;
        }

        if (!customer.DriverLicense) {
            customer.DriverLicense = payload.billing.driverLicense;
            needUpdate = true;
        }

        if (needUpdate) {
            await customer.save();
        }

        // --- NHÓM 4: LOGIC THỜI GIAN ---
        // Tạo Date object LOCAL (không UTC shift)
        const pickObj = buildDateObject(payload.pickupDate, payload.pickupTime);
        const dropObj = buildDateObject(payload.dropoffDate, payload.dropoffTime);

        // Validate hợp lệ
        if (isNaN(pickObj.getTime()) || isNaN(dropObj.getTime())) {
            return {
                EC: 1,
                EM: "Invalid pickup/dropoff datetime",
                DT: null,
            };
        }

        // Pickup phải sau thời điểm hiện tại
        const now = new Date();
        if (pickObj <= now) {
            return {
                EC: 1,
                EM: "Pickup time must be greater than current time",
                DT: null,
            };
        }

        // Dropoff phải sau pickup
        if (dropObj <= pickObj) {
            return {
                EC: 1,
                EM: "Dropoff must be after pickup",
                DT: null,
            };
        }

        // Tính rentalDays
        const msDiff = dropObj - pickObj;
        const rentalDays = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

        if (rentalDays <= 0) {
            return {
                EC: 1,
                EM: "Invalid rental duration",
                DT: null,
            };
        }

        // --- NHÓM 5: LOAD CAR + TÍNH TIỀN ---
        const carData = await Car.findOne({
            where: { CarId: payload.CarId }
        });

        if (!carData) {
            return {
                EC: 1,
                EM: "Car not found",
                DT: null
            };
        }

        // pricePerDay trong DB dạng decimal -> convert sang số
        const pricePerDay = Number(carData.PricePerDay);
        const subtotal = pricePerDay * rentalDays;
        const tax = subtotal * 0.08;
        const total = subtotal + tax;

        // --- NHÓM 6: CHECK OVERLAP RENTAL ---
        // Lấy tất cả rental đang pending hoặc approved của CarId này
        const conflictRental = await Rental.findOne({
            where: {
                CarId: payload.CarId,
                RentalStatus: {
                    [Op.in]: ["pending", "approved"]
                }
            }
        });

        if (conflictRental) {
            const existingPick = combineSQLDateTime(
                conflictRental.PickUpDate,
                conflictRental.PickUpTime
            );

            const existingDrop = combineSQLDateTime(
                conflictRental.DropOffDate,
                conflictRental.DropOffTime
            );

            if (isOverlapWithBuffer(pickObj, dropObj, existingPick, existingDrop, 2)) {
                return {
                    EC: 1,
                    EM: "Car is not available at this time",
                    DT: null
                };
            }
        }

        // --- NHÓM 7: GENERATE RENTAL ID + PAYMENT ID + INSERT (in transaction) ---
        const result = await sequelize.transaction(async (t) => {
            // 7.1 Generate RentalId
            const prefixRE = "RE";

            const latestRental = await Rental.findOne({
                where: { RentalId: { [Op.like]: `${prefixRE}%` } },
                order: [["RentalId", "DESC"]],
                lock: true,
                transaction: t,
            });

            const nextRentalNumber = latestRental
                ? parseInt(latestRental.RentalId.replace(prefixRE, ""), 10) + 1
                : 1;

            const nextRentalId = `${prefixRE}${String(nextRentalNumber).padStart(3, "0")}`;

            // 7.2 Generate PaymentId
            const prefixPM = "PM";

            const latestPayment = await Payment.findOne({
                where: { PaymentId: { [Op.like]: `${prefixPM}%` } },
                order: [["PaymentId", "DESC"]],
                lock: true,
                transaction: t,
            });

            const nextPaymentNumber = latestPayment
                ? parseInt(latestPayment.PaymentId.replace(prefixPM, ""), 10) + 1
                : 1;

            const nextPaymentId = `${prefixPM}${String(nextPaymentNumber).padStart(3, "0")}`;

            console.log("Generated IDs:", { nextRentalId, nextPaymentId });

            // 7.3 Chuẩn hoá DATE/TIME giống như test.js
            const pickDateForDB = payload.pickupDate; // "2025-12-10"
            const pickTimeForDB =
                payload.pickupTime.length === 5
                    ? payload.pickupTime + ":00"     // "13:00" -> "13:00:00"
                    : payload.pickupTime;

            const dropDateForDB = payload.dropoffDate;
            const dropTimeForDB =
                payload.dropoffTime.length === 5
                    ? payload.dropoffTime + ":00"
                    : payload.dropoffTime;

            console.log("=== SQL DATE/TIME FORMAT (RAW INSERT) ===");
            console.log("PickUpDate:", pickDateForDB);
            console.log("PickUpTime:", pickTimeForDB);
            console.log("DropOffDate:", dropDateForDB);
            console.log("DropOffTime:", dropTimeForDB);

            // 7.4 INSERT RENTAL bằng raw query (KHÔNG dùng Rental.create)
            await sequelize.query(
                `
        INSERT INTO [Rental] (
            [RentalId],
            [CustomerId],
            [CarId],
            [PickUpLocation],
            [PickUpDate],
            [PickUpTime],
            [DropOffLocation],
            [DropOffDate],
            [DropOffTime],
            [RentalStatus],
            [TotalAmount],
            [IssuedDate]
        )
        VALUES (
            :RentalId,
            :CustomerId,
            :CarId,
            :PickUpLocation,
            :PickUpDate,
            :PickUpTime,
            :DropOffLocation,
            :DropOffDate,
            :DropOffTime,
            :RentalStatus,
            :TotalAmount,
            :IssuedDate
        );
        `,
                {
                    replacements: {
                        RentalId: nextRentalId,
                        CustomerId: customer.CustomerId,
                        CarId: payload.CarId,
                        PickUpLocation: payload.pickupLocation,
                        PickUpDate: pickDateForDB,       // "YYYY-MM-DD"
                        PickUpTime: pickTimeForDB,       // "HH:mm:ss"
                        DropOffLocation: payload.dropoffLocation,
                        DropOffDate: dropDateForDB,
                        DropOffTime: dropTimeForDB,
                        RentalStatus: "pending",
                        TotalAmount: total,
                        IssuedDate: new Date().toLocaleString("sv-SE", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }).replace("T", " ")
                    },
                    transaction: t,
                }
            );

            // 7.5 INSERT PAYMENT trong cùng transaction (có thể dùng model)
            await Payment.create(
                {
                    PaymentId: nextPaymentId,
                    RentalId: nextRentalId,
                    PaymentDate: new Date(),
                    PaymentAmount: total,
                    PaymentMethod: payload.paymentMethod,
                    IsPaid: true,
                },
                { transaction: t }
            );

            // 7.6 Lấy lại rental vừa insert để trả về FE
            const newRental = await Rental.findOne({
                where: { RentalId: nextRentalId },
                transaction: t,
            });

            return { newRental };
        });

        const { newRental } = result;

        return {
            EC: 0,
            EM: "Rental inserted OK",
            DT: newRental,
        };


    } catch (err) {
        console.error('Checkout error:', err);
        return { EC: -1, EM: "Server error", DT: null };
    }

};

const normalizeRentalForList = (rental) => {
    const derivedStatus = deriveRentalStatus(rental);

    return {
        RentalId: rental.RentalId,
        RentalStatus: rental.RentalStatus,
        derivedStatus,

        TotalAmount: rental.TotalAmount,

        IssuedDate: rental.IssuedDate
            ? rental.IssuedDate.toISOString().slice(0, 19).replace("T", " ")
            : null,

        // ---- LOCATION ----
        PickUpLocation: rental.PickUpLocation,
        DropOffLocation: rental.DropOffLocation,

        // ---- DATE & TIME (FE FRIENDLY) ----
        pickupDate: rental.PickUpDate.toISOString().slice(0, 10),
        pickupTime: extractTimeFromSQL(rental.PickUpTime),
        dropoffDate: rental.DropOffDate.toISOString().slice(0, 10),
        dropoffTime: extractTimeFromSQL(rental.DropOffTime),

        customer: rental.Customer
            ? {
                  CustomerId: rental.Customer.CustomerId,
                  FullName: rental.Customer.FullName,
                  Email: rental.Customer.Email,
                  Phone: rental.Customer.Phone,
              }
            : null,

        car: rental.Car
            ? {
                  CarId: rental.Car.CarId,
                  Brand: rental.Car.Brand,
                  Model: rental.Car.Model,
              }
            : null,
    };
};

const fetchAllRentalsService = async () => {
    try {
        const rentals = await Rental.findAll({
            include: [
                {
                    model: Customer,
                    attributes: ["CustomerId", "FullName", "Email", "Phone"],
                },
                {
                    model: Car,
                    attributes: ["CarId", "Brand", "Model"],
                },
            ],
            order: [["IssuedDate", "DESC"]],
        });

        const normalized = rentals.map(normalizeRentalForList);

        return {
            EC: 0,
            EM: "Success",
            DT: normalized,
        };
    } catch (error) {
        console.error("fetchAllRentalsService error:", error);
        return {
            EC: -1,
            EM: "Internal server error",
            DT: null,
        };
    }
};

const fetchRentalsByStatusService = async (status) => {
    try {
        const s = (status || "").toLowerCase();

        // ================= DB STATUS =================
        if (ACTIVE_RENTAL_STATUSES.includes(s)) {
            const rentals = await Rental.findAll({
                where: { RentalStatus: s },
                include: [
                    {
                        model: Customer,
                        attributes: ["CustomerId", "FullName", "Email", "Phone"],
                    },
                    {
                        model: Car,
                        attributes: ["CarId", "Brand", "Model"],
                    },
                ],
                order: [["IssuedDate", "DESC"]],
            });

            return {
                EC: 0,
                EM: "Success",
                DT: rentals.map(normalizeRentalForList),
            };
        }

        // ================= DERIVED STATUS =================
        if (DERIVED_RENTAL_STATUSES.includes(s)) {
            const approvedRentals = await Rental.findAll({
                where: { RentalStatus: "approved" },
                include: [
                    {
                        model: Customer,
                        attributes: ["CustomerId", "FullName", "Email", "Phone"],
                    },
                    {
                        model: Car,
                        attributes: ["CarId", "Brand", "Model"],
                    },
                ],
                order: [["IssuedDate", "DESC"]],
            });

            const nowMs = Date.now();

            const filtered = approvedRentals.filter((r) => {
                const pick = combineSQLDateTime(r.PickUpDate, r.PickUpTime);
                const drop = combineSQLDateTime(r.DropOffDate, r.DropOffTime);

                if (s === "in_progress") {
                    return pick.getTime() <= nowMs && nowMs <= drop.getTime();
                }

                // completed
                return nowMs > drop.getTime();
            });

            return {
                EC: 0,
                EM: "Success",
                DT: filtered.map(normalizeRentalForList),
            };
        }

        return { EC: 1, EM: "Invalid rental status", DT: null };
    } catch (error) {
        console.error("fetchRentalsByStatusService error:", error);
        return { EC: -1, EM: "Internal server error", DT: null };
    }
};

const fetchRentalSummaryService = async () => {
    try {
        const all = await Rental.findAll();
        const nowMs = Date.now();

        const summary = {
            pending: 0,
            approved: 0,
            rejected: 0,
            cancelled: 0,
            in_progress: 0,
            completed: 0,
        };

        for (const r of all) {
            const status = r.RentalStatus;

            if (summary[status] !== undefined) {
                summary[status]++;
            }

            if (status === "approved") {
                const pick = combineSQLDateTime(r.PickUpDate, r.PickUpTime);
                const drop = combineSQLDateTime(r.DropOffDate, r.DropOffTime);

                if (pick.getTime() <= nowMs && nowMs <= drop.getTime()) {
                    summary.in_progress++;
                } else if (nowMs > drop.getTime()) {
                    summary.completed++;
                }
            }
        }

        return {
            EC: 0,
            EM: "Success",
            DT: summary,
        };
    } catch (err) {
        console.error("fetchRentalSummaryService error:", err);
        return { EC: -1, EM: "Internal server error", DT: null };
    }
};

//--- Helper: derive status  ---
const deriveRentalStatus = (rental) => {
    if (rental.RentalStatus !== "approved") {
        return rental.RentalStatus;
    }

    const nowMs = Date.now();

    const pick = combineSQLDateTime(
        rental.PickUpDate,
        rental.PickUpTime
    );
    const drop = combineSQLDateTime(
        rental.DropOffDate,
        rental.DropOffTime
    );

    if (pick.getTime() <= nowMs && nowMs <= drop.getTime()) {
        return "in_progress";
    }

    if (nowMs > drop.getTime()) {
        return "completed";
    }

    return "approved";
};

//--- Helper: available actions ---
const getAvailableActions = (rental) => {
    const actions = [];
    const nowMs = Date.now();

    if (rental.RentalStatus === "pending") {
        actions.push("approve", "reject");
        return actions;
    }

    if (rental.RentalStatus === "approved") {
        const pick = combineSQLDateTime(
            rental.PickUpDate,
            rental.PickUpTime
        );

        if (nowMs < pick.getTime()) {
            actions.push("cancel");
        }
        return actions;
    }

    return actions;
};

const fetchRentalByIdService = async (rentalId) => {
    try {
        const rental = await Rental.findOne({
            where: { RentalId: rentalId },
            include: [
                {
                    model: Customer,
                    attributes: ["CustomerId", "FullName", "Email", "Phone", "DriverLicense"],
                },
                {
                    model: Payment,
                    attributes: ["PaymentId", "PaymentMethod", "PaymentAmount"],
                },
                {
                    model: Car,
                    attributes: ["CarId", "Brand", "Model", "PricePerDay", "ImagePath"],
                },
            ],
        });

        if (!rental) {
            return { EC: 1, EM: "Rental not found", DT: null };
        }

        // ===== NORMALIZE PAYMENT =====
        const payment = rental.Payments?.[0] || null;

        // ===== NORMALIZE DATETIME =====
        const pickupDateTime = combineSQLDateTime(
            rental.PickUpDate,
            rental.PickUpTime
        );

        const dropoffDateTime = combineSQLDateTime(
            rental.DropOffDate,
            rental.DropOffTime
        );

        const derivedStatus = deriveRentalStatus(rental);
        const availableActions = getAvailableActions(rental);

        return {
            EC: 0,
            EM: "Success",
            DT: {
                rental: {
                    RentalId: rental.RentalId,
                    RentalStatus: rental.RentalStatus,
                    TotalAmount: rental.TotalAmount,
                    IssuedDate: rental.IssuedDate,

                    // ---- LOCATION ----
                    PickUpLocation: rental.PickUpLocation,
                    DropOffLocation: rental.DropOffLocation,

                    // ---- DATE & TIME (FE FRIENDLY) ----
                    pickupDate: rental.PickUpDate.toISOString().slice(0, 10),
                    pickupTime: extractTimeFromSQL(rental.PickUpTime),
                    dropoffDate: rental.DropOffDate.toISOString().slice(0, 10),
                    dropoffTime: extractTimeFromSQL(rental.DropOffTime),

                    // ---- DATETIME (FOR LOGIC / ADMIN) ----
                    pickupDateTime,
                    dropoffDateTime,

                    derivedStatus,
                },

                customer: rental.Customer,
                car: rental.Car,
                payment,
                availableActions,
            },
        };
    } catch (error) {
        console.error("fetchRentalByIdService error:", error);
        return { EC: -1, EM: "Internal server error", DT: null };
    }
};

//--- Helper: map User and Employee ---
const getEmployeeIdByUserId = async (userId, transaction) => {
    const employee = await Employee.findOne({
        where: { UserId: userId },
        transaction,
    });
    return employee ? employee.EmployeeId : null;
};

const approveRentalService = async (rentalId, adminUserId) => {
    let t;
    try {
        t = await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        });

        const employeeId = await getEmployeeIdByUserId(adminUserId, t);
        if (!employeeId) {
            await t.rollback();
            return { EC: 1, EM: "Employee not found", DT: null };
        }

        const rental = await Rental.findOne({
            where: { RentalId: rentalId },
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!rental) {
            await t.rollback();
            return { EC: 1, EM: "Rental not found", DT: null };
        }

        if (rental.RentalStatus !== "pending") {
            await t.rollback();
            return {
                EC: 1,
                EM: `Cannot approve rental in status '${rental.RentalStatus}'`,
                DT: null,
            };
        }

        const pick = combineSQLDateTime(
            rental.PickUpDate,
            rental.PickUpTime
        );
        const drop = combineSQLDateTime(
            rental.DropOffDate,
            rental.DropOffTime
        );

        const existing = await Rental.findAll({
            where: {
                CarId: rental.CarId,
                RentalStatus: "approved",
                RentalId: { [Op.ne]: rental.RentalId },
            },
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        for (const r of existing) {
            const ePick = combineSQLDateTime(r.PickUpDate, r.PickUpTime);
            const eDrop = combineSQLDateTime(r.DropOffDate, r.DropOffTime);

            if (isOverlapWithBuffer(pick, drop, ePick, eDrop, 2)) {
                await t.rollback();
                return {
                    EC: 1,
                    EM: "Time overlaps with an existing approved rental",
                    DT: null,
                };
            }
        }

        await rental.update(
            {
                RentalStatus: "approved",
                ProcessedBy: employeeId,
            },
            { transaction: t }
        );

        await t.commit();
        return { EC: 0, EM: "Rental approved", DT: { RentalId: rentalId } };
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        console.error("approveRentalService error:", error);
        return { EC: -1, EM: "Internal server error", DT: null };
    }
};

const rejectRentalService = async (rentalId, adminUserId) => {
    let t;
    try {
        t = await sequelize.transaction();

        const employeeId = await getEmployeeIdByUserId(adminUserId, t);
        if (!employeeId) {
            await t.rollback();
            return { EC: 1, EM: "Employee not found", DT: null };
        }

        const rental = await Rental.findOne({
            where: { RentalId: rentalId },
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!rental) {
            await t.rollback();
            return { EC: 1, EM: "Rental not found", DT: null };
        }

        if (rental.RentalStatus !== "pending") {
            await t.rollback();
            return {
                EC: 1,
                EM: `Cannot reject rental in status '${rental.RentalStatus}'`,
                DT: null,
            };
        }

        await rental.update(
            {
                RentalStatus: "rejected",
                ProcessedBy: employeeId,
            },
            { transaction: t }
        );

        await t.commit();
        return { EC: 0, EM: "Rental rejected", DT: { RentalId: rentalId } };
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        console.error("rejectRentalService error:", error);
        return { EC: -1, EM: "Internal server error", DT: null };
    }
};

const cancelRentalService = async (rentalId, adminUserId) => {
    let t;
    try {
        t = await sequelize.transaction();

        const employeeId = await getEmployeeIdByUserId(adminUserId, t);
        if (!employeeId) {
            await t.rollback();
            return { EC: 1, EM: "Employee not found", DT: null };
        }

        const rental = await Rental.findOne({
            where: { RentalId: rentalId },
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!rental) {
            await t.rollback();
            return { EC: 1, EM: "Rental not found", DT: null };
        }

        if (rental.RentalStatus !== "approved") {
            await t.rollback();
            return {
                EC: 1,
                EM: `Cannot cancel rental in status '${rental.RentalStatus}'`,
                DT: null,
            };
        }

        const pick = combineSQLDateTime(
            rental.PickUpDate,
            rental.PickUpTime
        );

        if (Date.now() >= pick.getTime()) {
            await t.rollback();
            return {
                EC: 1,
                EM: "Cannot cancel rental after it has started",
                DT: null,
            };
        }

        await rental.update(
            {
                RentalStatus: "cancelled",
                ProcessedBy: employeeId,
            },
            { transaction: t }
        );

        await t.commit();
        return { EC: 0, EM: "Rental cancelled", DT: { RentalId: rentalId } };
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        console.error("cancelRentalService error:", error);
        return { EC: -1, EM: "Internal server error", DT: null };
    }
};

module.exports = {
    checkoutRentalService,
    fetchAllRentalsService,
    fetchRentalsByStatusService,
    fetchRentalSummaryService,
    fetchRentalByIdService,
    approveRentalService,
    rejectRentalService,
    cancelRentalService
};
