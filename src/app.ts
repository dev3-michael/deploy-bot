import * as dotenv from "dotenv";
import { exec } from "child_process";
import { Telegraf } from "telegraf";
import { useNewReplies } from "telegraf/future";
import MESSSAGES_FIRST from "./messagesFirst.json";
import MESSSAGES_SECOND from "./messagesSecond.json";

dotenv.config();

const botToken = process.env.BOT_TOKEN; // token bot
const groupChatId = process.env.GROUP_ID; // group id
const commandMappingProjects = {
  help: "help",
  deployz003: "web-z003",
  deployz01: "z01sv-02",
  deployz101: "web-z101",
  deployz402: "web-z400-002",
  deployz403: "web-z400-003",
  deployz404: "web-z400-004",
  deployz405: "web-z400-005",
  deployz406: "web-z400-006",
  deployz408: "web-z400-008",
};
const commandlineMessage = `\n\n/deployz003\nShort Descripton: \n\n/deployz01\nShort Descripton: \n\n/deployz101\nShort Descripton: \n\n/deployz402\nShort Descripton: \n\n/deployz403\nShort Descripton: \n\n/deployz404\nShort Descripton: \n\n/deployz405\nShort Descripton: \n\n/deployz406\nShort Descripton: \n\n/deployz408\nShort Descripton: \n\n`;
const messageToQCMembers = "@bpm_sonny @qcba_gump @qcba_wukong";

if (typeof botToken !== "string") throw new Error("Need a token").message;
if (typeof groupChatId !== "string") throw new Error("Need a group id").message;

function randomNumber(min: any = 0, max: any = 6) {
  return parseInt(Math.random() * (max - min) + min);
}

const bot = new Telegraf(botToken);

const sendMessageInGroup = (message: string) =>
  bot.telegram.sendMessage(groupChatId, message);

const handleDeployProcess = async (
  projectId: any,
  description: any,
  ctx: any,
  isNode14: any
) => {
  ctx.reply(MESSSAGES_FIRST[randomNumber()]);

  sendMessageInGroup(
    `To: ${messageToQCMembers} \n\nProject Id: ${projectId}\nStatus: Deploying\nShort Description: ${description} \n\n`
  );
  try {
    console.log("projectId", projectId);
    exec(
      `bash /Users/admin/Documents/project/z-project/build/${projectId}/deploy.sh /Users/admin/Documents/project/z-project/build/${projectId}`,
      {
        maxBuffer: 8 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        console.log("error", error);
        console.log("stdout", stdout);
        console.log("stderr", stderr);

        if (error !== null) {
          ctx.reply(`Build lỗi rồi Chú, check lại lẹ lẹ \n Message: ${error}`);
          sendMessageInGroup(
            `To: ${messageToQCMembers} \n\nProject Id: ${projectId}\nStatus: Failed\n\nShort Description: ${description} \n`
          );
        } else {
          ctx.reply(MESSSAGES_SECOND[randomNumber()]);
          sendMessageInGroup(
            `To: ${messageToQCMembers} \n\nProject Id: ${projectId}\nStatus: Done\n\nShort Description: ${description} \n`
          );
        }
      }
    );
  } catch (error) {
    console.log("error", error);
    ctx.reply(`Build lỗi rồi Chú, check lại lẹ lẹ \n Message: ${error}`);
    sendMessageInGroup(
      `To: ${messageToQCMembers} \n\nProject Id: ${projectId}\nStatus: Failed\n\nShort Description: ${description} \n`
    );
  }
};

const onMessage = (ctx: any) => {
  const data = ctx.message.text.split("\n");
  const commandText = data[0].split("/")[1].trim() || "";

  if ("help" === getProjectIdByCommand(commandMappingProjects, commandText)) {
    ctx.reply(
      `Gõ\n\n/projectKey+deploy\nDescripton: [TicketID] short description (1 line).\n\n- Ví dụ:\n\n/z003deploy\nShort Descripton: [WZ001-01] Implement News detail feature\n\n- List command:${commandlineMessage}`
    );
    return;
  }

  // Validate
  if (!Object.keys(commandMappingProjects).includes(commandText)) {
    ctx.reply(`Command hướng dẫn rùi còn sai ba :)) Lần sau phạt nghe.`);
    return;
  }

  const description = data[1] ? data[1].split(":")[1].trim() : "";
  if (description === "") {
    ctx.reply(`Deploy mà không có Description hả ní.`);
    return;
  }

  // Deploying
  const commandList = commandMappingProjects;
  Object.freeze(commandList);

  const isNode14 = isBuildWithNode14(commandList, commandText);
  if (isNode14) {
    ctx.reply(`Chưa setup kịp. build bằng command line trước đi brother.`);
  }

  handleDeployProcess(
    getProjectIdByCommand(commandMappingProjects, commandText),
    description,
    ctx,
    isNode14
  );
};

const getProjectIdByCommand = (commandLine: any, searchKey: any) => {
  return commandLine[searchKey] || null;
};

const isBuildWithNode14 = (commandList: any, commandText: any) => {
  return (
    getProjectIdByCommand(commandMappingProjects, commandText) ==
      commandList.deployz003 ||
    getProjectIdByCommand(commandMappingProjects, commandText) ==
      commandList.deployz101
  );
};

bot.use(useNewReplies());
bot.start((ctx) => ctx.reply("welcome"));
bot.on("text", onMessage);
bot.launch();
