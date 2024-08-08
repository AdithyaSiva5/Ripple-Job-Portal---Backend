"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const userModel_1 = __importDefault(require("../models/user/userModel"));
function runScheduledTask() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const users = yield userModel_1.default.find({});
            for (const user of users) {
                const expiryDate = user.premiumExpiryDate;
                if (expiryDate instanceof Date) {
                    const expiryDateAsDate = expiryDate;
                    if (expiryDateAsDate < new Date()) {
                        user.isPremium = false;
                    }
                }
                user.dailyJobsApplied = 0;
                yield user.save();
            }
            console.log('Cron job executed successfully');
        }
        catch (error) {
            console.error('Error executing cron job:', error);
        }
    });
}
node_cron_1.default.schedule('0 0 * * *', runScheduledTask);
exports.default = runScheduledTask;
