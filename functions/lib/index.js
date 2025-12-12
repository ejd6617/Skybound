"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = void 0;
const sgMail = __importStar(require("@sendgrid/mail"));
const params_1 = require("firebase-functions/params");
const v2_1 = require("firebase-functions/v2");
const https_1 = require("firebase-functions/v2/https");
// 🔐 Secrets (replaces functions.config)
const SENDGRID_API_KEY = (0, params_1.defineSecret)("SENDGRID_API_KEY");
const FROM_EMAIL = (0, params_1.defineSecret)("FROM_EMAIL");
const FROM_NAME = (0, params_1.defineSecret)("FROM_NAME");
// 🌎 Global settings
(0, v2_1.setGlobalOptions)({ maxInstances: 10 });
/**
 * Send Welcome Email (Callable)
 */
exports.sendWelcomeEmail = (0, https_1.onCall)({
    secrets: [SENDGRID_API_KEY, FROM_EMAIL, FROM_NAME],
}, async (request) => {
    const { email, name } = request.data;
    if (!email || !name) {
        throw new https_1.HttpsError("invalid-argument", "Email and name are required.");
    }
    // Set the API key securely
    sgMail.setApiKey(SENDGRID_API_KEY.value());
    const msg = {
        to: email,
        from: {
            email: FROM_EMAIL.value(),
            name: FROM_NAME.value(),
        },
        subject: `Welcome to Skybound, ${name}!`,
        html: `
        <h1>Welcome to Skybound!</h1>
        <p>Hello ${name}, your account is ready.</p>
      `,
    };
    try {
        await sgMail.send(msg);
        return { success: true };
    }
    catch (error) {
        console.error("SendGrid Error:", error);
        throw new https_1.HttpsError("internal", "Failed to send email.");
    }
});
//# sourceMappingURL=index.js.map