import { Router } from "express";
import { getTurnServer } from "../controller/twilio.controller";

const TwilioRouter = Router()

TwilioRouter.get('/turn-server',getTurnServer)

export default TwilioRouter