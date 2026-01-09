const crypto = require('crypto'); 

function mapPayloadByStatus(status) {
    switch (status) {
        case "Dispatched":
        case "dispatched":
            return "01";
        case "Waitlist":
            return "02";
        default:
            return "03";
    }
}

async function sendDownlink(devEUI, status) {
    const payload = mapPayloadByStatus(status);
    const fPort = "2";
    const asId = process.env.THINGPARK_AS_ID;
    const asKey = process.env.THINGPARK_AS_KEY; 
    const time = new Date().toISOString(); 

    // 1. Build the query string for signing (ORDER MATTERS)
    // The documentation expects: DevEUI, FPort, Payload, AS_ID, Time
    const queryString = `DevEUI=${devEUI}&FPort=${fPort}&Payload=${payload}&AS_ID=${asId}&Time=${time}`;

    // 2. Compute the Token: SHA-256(queryString + AS_KEY)
    // Note: The Key is appended directly to the end of the string without a separator
    const token = crypto
        .createHash('sha256')
        .update(queryString + asKey)
        .digest('hex');

    console.log(`[Downlink] Calculated Token: ${token}`);

    const url = new URL("https://lns.packetworx.net/thingpark/lrc/rest/v2/downlink");

    // 3. Set the search params (the values must match exactly what was hashed)
    url.search = new URLSearchParams({
        DevEUI: devEUI,
        FPort: fPort,
        Payload: payload,
        AS_ID: asId,
        Time: time,
        Token: token
    });

    console.log(`[Downlink] URL: ${url.toString()}`);

    const response = await fetch(url.toString(), { method: "POST" });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Downlink] Failed to send: ${errorText}`);
        throw new Error(`ThingPark Downlink Failed: ${errorText}`);
    }

    console.log(`[Downlink] Successfully sent to DevEUI: ${devEUI}`);
    return { payloadSent: payload, statusCode: response.status };
}

module.exports = { sendDownlink };