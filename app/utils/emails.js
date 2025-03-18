import { mailTrapclient, sender } from "../configs/mailTrap.js";
import { PASSWORD_RESET_REQUEST_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";

export async function sendVerificationCode(email, code) {
    const recipient = [{email}];
    const message = `Your verification code is: ${code}`;
    const subject = "Verification Code";
    try {
        const response = await mailTrapclient.send({
            from: sender,
            to: recipient,
            subject: subject,
            html:VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}",code),
            category:"Email verification"
        })
        
    } catch (error) {
        
        console.error("error:",error);
        
    }
}

export async function sendForgotPaswordLink(email, link){
    const recipient = [{email}];
    const subject = "Forgot Password Link";
    try {
        const response = await mailTrapclient.send({
            from: sender,
            to: recipient,
            subject: subject,
            html:PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}",link),
        })
        console.log("Email sent");
    }
    
    catch(error){
        console.error("error:",error);
    }
}