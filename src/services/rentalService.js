const { combineSQLDateTime, buildDateObject } = require("../utils/datetimeUtils");
const Car = require("../models/Car");
const { Op } = require("sequelize");
const { sequelize } = require("../config/Sequelize");
const Rental = require("../models/Rental");
const Payment = require("../models/Payment");

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

        function safeTimeStr(t) {
            if (!t) return "00:00";
            if (typeof t === "string") {
                return t.substring(0, 5);
            }
            if (t instanceof Date) {
                return t.toTimeString().substring(0, 5);
            }
            if (typeof t === "object" && "hours" in t && "minutes" in t) {
                return `${String(t.hours).padStart(2, "0")}:${String(t.minutes).padStart(2, "0")}`;
            }
            return "00:00";
        }

        function formatSQLDateToYMD(dateObj) {
            const y = dateObj.getFullYear();
            const m = String(dateObj.getMonth() + 1).padStart(2, "0");
            const d = String(dateObj.getDate()).padStart(2, "0");
            return `${y}-${m}-${d}`;
        }

        if (conflictRental) {
            const existingPick = combineSQLDateTime(
                conflictRental.PickUpDate,
                conflictRental.PickUpTime
            );

            const existingDrop = combineSQLDateTime(
                conflictRental.DropOffDate,
                conflictRental.DropOffTime
            );

            const isOverlap =
                existingPick < dropObj &&
                existingDrop > pickObj;

            if (isOverlap) {
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
                        IssuedDate: new Date().toISOString().slice(0, 19).replace("T", " ")
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

module.exports = {
    checkoutRentalService,
};