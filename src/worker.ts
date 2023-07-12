import { db } from "@/utils/db";

onmessage = (message) => {
    console.log(message.data.type);
    console.log(message.data.data);
}