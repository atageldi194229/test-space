"use strict";

const {
    Payment,
    Notification,
    sequelize,
    Sequelize: {Op},
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const obj = {};

const tools = {
    filter: (s) => {
        let where = {};
        if (s === "allowed") {
            where.status = 1;
        } else if (s === "cancelled") {
            where.status = 2;
        } else if (s === "waiting") {
            where.status = 0;
        }

        return where;
    },
    sort: (s) => {
        try {
            // validate data
            let a = s.split("-");
            a[1] = a[1].toLowerCase();

            let k = ["allowedAt", "createdAt"];

            if (k.includes(a[0]) && ["asc", "desc"].includes(a[1])) {
                return [a[0], a[1]];
            }
        } catch (err) {
        }
        return ["createdAt", "desc"];
    },
    search: (text, from) => {
        text = (text || "").toLowerCase();
        return sequelize.where(
            sequelize.fn("LOWER", sequelize.col(from)),
            "LIKE",
            "%" + text + "%"
        );
    }
};

/**
 * prepare options for getting payments from db using sequelize
 */
function prepareOptions({limit, offset, sort, filter, search}) {

    const userAssociation =  {
        association: "user",
        attributes: ["id", "username", "email", "phoneNumber"],
    };

    let options = {
        distinct: "id",
        limit,
        offset,
        where: {
            // [Op.or]: [
                // tools.search(search, "user.username"),
                // tools.search(search, "User.email"),
                // tools.search(search, "User.phone_number"),
            // ],
        },
        include: [ userAssociation ],
    };

    if(search) {
        userAssociation.where = {
            [Op.or]: [
                tools.search(search, "user.username"),
                tools.search(search, "user.email"),
                tools.search(search, "user.phone_number"),
            ]
        }
    }

    options.order = [tools.sort(sort)];
    options.where = {...options.where, ...tools.filter(filter)};

    return options;
}

/**
 * get all payments
 * action - /admin/payments
 * method - get
 * token
 */
obj.getAll = async (req, res) => {
    // client data
    let {query} = req,
        limit = parseInt(query.limit) || 20,
        offset = parseInt(query.offset) || 0,
        sort = query.sort,
        filter = query.filter,
        search = query.search;

    // prepare options
    let options = prepareOptions({limit, offset, sort, filter, search});
    // request db
    let payments = await Payment.findAll(options);
    let paymentCount = await Payment.count({
        where: options.where,
    });

    // client response
    res.status(200).json({
        success: true,
        paymentCount,
        payments: payments.map(ee => {
            let e = ee.toJSON();

            let leftTime = null;
            if (e.allowedAt) {
                leftTime =
                        Math.round((new Date(e.allowedAt.setMonth(new Date().getMonth() + 1)).getTime() - new Date().getTime()) / 1000 / 60 / 60 / 24);
            }

            return {
                ...e,
                leftTime,
            }
        }),
    });
};

/**
 * update test
 * action - /admin/payments/:id
 * method - put
 * token
 */
obj.update = async (req, res, next) => {
    // client data
    let {status, note} = req.body,
        modifiedBy = req.user.id,
        {id} = req.params;

    // request db
    let payment = await Payment.findOne({where: {id}});

    // prepare data
    let data = {status, modifiedBy, note};
    if (status === 1) {
        data.allowedAt = new Date();
    } else if (status === 2) {
        data.allowedAt = null;
    } else if (status) {
        return next(new ErrorResponse("Invalid data"));
    }

    let updatedRows = await payment.update(data);

    // error test
    if (!updatedRows) return next(new ErrorResponse("Payment is not updated"));

    // send notification
    let payload = {
        id: payment.id,
        tsc: (payment.isTscUnlimited && "unlimited") || payment.tsc,
        tcc: (payment.isTccUnlimited && "unlimited") || payment.tcc,
        tscMoney: payment.tscMoney,
        tccMoney: payment.tccMoney,
        totalPrice:
            (payment.isTscUnlimited
                ? payment.tscMoney
                : payment.tscMoney * payment.tsc) +
            (payment.isTccUnlimited
                ? payment.tccMoney
                : payment.tccMoney * payment.tcc),
        createdAt: payment.createdAt.toLocaleString(),
    };

    if (status === 1) {
        payload.allowedAt = data.allowedAt;
        payload.finishesAt = new Date(
            30 * 24 * 60 * 60 * 1000 + data.allowedAt.getTime()
        );

        await Notification.send(payment.userId, {
            type: "payment-allowed",
            payload,
        });
    } else if (status === 2) {
        payload.cancelledAt = new Date();

        await Notification.send(payment.userId, {
            type: "payment-cancelled",
            payload,
        });
    }

    // client response
    res.status(200).json({
        success: true,
    });
};

// When exporting all collected data
let keys = Object.keys(obj);
// exclude some functions
let excluded_keys = [];
for (let i = 0; i < keys.length; i++)
    if (!excluded_keys.includes(keys[i]))
        obj[keys[i]] = asyncHandler(obj[keys[i]]);
// exporting all functions
module.exports = obj;
