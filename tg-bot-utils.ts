import {
    ForceReply,
    InlineKeyboardMarkup,
    MessageEntity,
    MessageUpdate,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
    SendMessage,
    TelegramBot,
    UpdateType,
  } from "https://deno.land/x/telegram_bot_api@0.4.0/mod.ts";

  import {replymsg_params, sendmsg_params} from "./types.ts";
  type type_cb = (msg: Context) => void;
  class Context {
    constructor(
      public original: MessageUpdate,
      public parsed_text: string,
      private bot: TelegramBot,
    ) {
    }
  
    reply(reply: string | replymsg_params) {
      const minimalParams: sendmsg_params = {
        chat_id: this.original.message.chat.id,
        text: ''
      };
      if (typeof reply === "string") {
        minimalParams.text = reply;
      } else {
        Object.assign(minimalParams, reply);
      }
      return this.bot.sendMessage(minimalParams);
    }
  }
  
  export class TgUtils {
    commandList: Map<string, type_cb> = new Map();
    constructor(private bot: TelegramBot) {
      bot.on(UpdateType.Message, (msg) => {
        const text = msg.message?.text ? msg.message.text.trimStart() : null;
        if (text != null && text.startsWith("/")) {
          const space = text.indexOf(" ");
          let command: string;
          let payload: string;
          if (space > -1) {
            command = text.substring(1, space);
            payload = text.substring(space + 1);
          } else {
            command = text.substring(1);
            payload = "";
          }
          if (this.commandList.has(command)) {
            this.commandList.get(command)!(new Context(msg, payload, bot));
          }
        }
      });
    }
    onCommand(command: string | string[], cb: type_cb) {
      if (typeof command == "string") {
        command = [command];
      }
  
      for (const com of command) {
        this.commandList.set(com, cb);
      }
    }
  }
  