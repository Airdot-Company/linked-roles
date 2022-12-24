require("dotenv").config();
const { LinkedRoles: LinkedRolesClient, MetadataFieldBuilder, MetadataType } = require("../dist");
const express = require("express");

const app = express();

const LinkedRoles = new LinkedRolesClient({
    clientId: process.env.CLIENT_ID,
    token: process.env.TOKEN,
    cookieSecret: "cookie_secret_a402uthjnjdf",
    platformName: "Linked Roles",
    redirectURL: "http://localhost:5000/discord-oauth-callback",
    secret: process.env.CLIENT_SECRET
});

LinkedRoles.SetMetadataRecords([
    new MetadataFieldBuilder()
        .setName("Messages")
        .setDescription("How many messages they sent.")
        .setKey("messages")
        .setType(MetadataType.IntegerGreaterThanOrEqual)
]);

LinkedRoles.AttachExpressApp(app);

app.listen(5000, () => console.log("http://localhost:5000/"))