import {body} from "express-validator";

export const createAdminValidation = [
    body("name")
        .trim()
        .toLowerCase()
        .notEmpty().withMessage("Nome richiesto").bail(),

    body("username")
        .trim()
        .toLowerCase()
        .notEmpty().withMessage("Username richiesto").bail(),

    body("email")
        .trim()
        .toLowerCase()
        .isEmail().withMessage("Email richiesta").bail(),

    body("password")
        .notEmpty().withMessage("Password richiesta").bail()
        .isString().withMessage("Password deve essere una stringa").bail()
        .isLength({ min: 6 }).withMessage("Password troppo corta"),
]