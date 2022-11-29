import { ButtonInteraction as DiscordButtonInteraction, ChannelType, ChatInputCommandInteraction, GuildMember, InteractionType, User as DiscordUser } from "discord.js";
import { HexColorString } from "./typings";
import { Channel, ColorResolvable, GuildTextBasedChannel, NewsChannel, TextChannel as GuildTextChannel } from "discord.js";
import fetch from "axios";

function Member(member: any, canBeNull: boolean = false): member is GuildMember {
    if (canBeNull && member == null) return true;
    else if (!canBeNull && member == null) return false;

    return member instanceof GuildMember;
}

function User(user: any): user is DiscordUser {
    return user instanceof User;
}

function CommandInteraction(interaction: any, canBeNull: boolean = false): interaction is ChatInputCommandInteraction {
    if (canBeNull && interaction == null) return true;
    else if (!canBeNull && interaction == null) return false;
    if (interaction?.type == null) return false;
    return interaction.type == InteractionType.ApplicationCommand;
}

function ButtonInteraction(interaction: any, canBeNull: boolean = false): interaction is DiscordButtonInteraction {
    if (canBeNull && interaction == null) return true;
    else if (!canBeNull && interaction == null) return false;
    if (interaction?.type == null) return false;
    return interaction.type == InteractionType.MessageComponent;
}

function TextChannel(channel: any, canBeNull: boolean = false): channel is GuildTextChannel {
    if (canBeNull && channel == null) return true;
    else if (!canBeNull && channel == null) return false;
    if (channel?.type == null) return false;
    return channel.type == ChannelType.GuildText;
}

function HexColor(str: string): str is `#${string}` {
    return str.startsWith("#");
}

function String(str: string): str is string {
    if (str == '') return false;
    return typeof str == 'string';
}

const LinkRegEx = {
    Strict: (/^(http|https):\/\/[^ "]+$/gi),
    Lazy: (/^([a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+.*)$/gi)
};

function Link(str: string, strict: boolean = true) {
    const RegEx = (strict ? LinkRegEx.Strict : LinkRegEx.Lazy);
    return RegEx.test(str);
}

async function InviteLink(str: string) {
    const regex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite|discord.com\/invite|watchanimeattheoffice.com\/invite|dis.gd\/invite|bigbean.solutions\/invite)\/+[a-zA-Z0-9]{4,16}/gi;
    if (!Link(str, false)) return false;
    if (!str.startsWith("http://") || !str.startsWith("https://")) str = `http://${str}`;
    const web = await fetch(str);
    const location = web.request.res.responseUrl;
    return location.startsWith("https://discord.com/invite");
}

// function TextChannel(channel: any): channel is GuildTextBasedChannel {
//     return channel?.send != null;
// }

function GuildChannel(channel: any): channel is (NewsChannel | GuildTextChannel) {
    return channel?.send != null;
}

function Emoji(emoji: string, animated: boolean = false) {
    if (!String(emoji)) return false;
    return (
        emoji.startsWith("<:") || (animated == true ? emoji.startsWith("<a:") : false)
    ) && emoji.endsWith(">") && emoji.length >= 20;
}

function NumberString(str: string) {
    return !isNaN(Number(str));
}

export const Verifiers = {
    Discord: {
        Member,
        User,
        CommandInteraction,
        ButtonInteraction,
        TextChannel,
        GuildChannel,
        InviteLink
    },
    HexColor,
    Link,
    Emoji,
    NumberString,
    String
}