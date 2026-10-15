const moods = [
  { emoji: "☀️", name: "开心", text: "今天心情很好，想和宝宝分享小事。", note: "想把遇见的有趣事情都讲给宝宝听。" },
  { emoji: "🌙", name: "慵懒", text: "今天想慢下来，安静一会儿。", note: "想和宝宝窝在一起，什么也不急着做。" },
  { emoji: "🌧️", name: "安静", text: "今天想安静地整理一下思绪。", note: "也想听听宝宝今天发生了什么。" }
];

let moodIndex = 0;
const messagesBox = document.getElementById("messages");
const input = document.getElementById("msg");
const sendButton = document.getElementById("sendButton");
const STORAGE_KEY = "pinkNestChatHistoryV2";

function getTime() {
  return new Date().toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function saveMessages() {
  try {
    const messages = Array.from(
      messagesBox.querySelectorAll(".message-row")
    ).map(row => ({

sender: row.dataset.sender,
      text: row.querySelector(".bubble")?.textContent || "",
      time: row.querySelector(".message-time")?.textContent || ""
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.warn("保存聊天记录失败：", error);
  }
}

function addMessage(text, sender, time = getTime(), save = true) {
  const row = document.createElement("div");
  row.className = "message-row " +
    (sender === "user" ? "user-row" : "assistant-row");
  row.dataset.sender = sender;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = sender === "user" ? "🌸" : "🖤";

  const content = document.createElement("div");
  content.className = "message-content";

  const bubble = document.createElement("div");
  bubble.className = sender === "user"
    ? "bubble user-bubble"
    : "bubble";
  bubble.textContent = text;

  const timeLabel = document.createElement("div");
  timeLabel.className = "message-time";
  timeLabel.textContent = time;

  content.appendChild(bubble);
  content.appendChild(timeLabel);

  if (sender === "user") {
    row.appendChild(content);
    row.appendChild(avatar);
  } else {
    row.appendChild(avatar);
    row.appendChild(content);
  }

  messagesBox.appendChild(row);
  row.scrollIntoView({ behavior: "smooth", block: "nearest" });

  if (save) saveMessages();
  return row;
}

function loadMessages() {
  try {
    // 优先读取新版记录
    let saved = localStorage.getItem(STORAGE_KEY);

    // 如果没有新版记录，尝试迁移旧版记录
    if (!saved) {
      const oldSaved = localStorage.getItem("pinkNestChatHistory");

      if (oldSaved) {
        const oldMessages = JSON.parse(oldSaved);
        if (Array.isArray(oldMessages)) {
          const migrated = oldMessages
            .filter(item => item && typeof item.text === "string")
            .map(item => ({
              sender: item.className?.includes("user-bubble")
                ? "user"
                : "assistant",
              text: item.text,
              time: "旧消息"
            }));

          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          saved = JSON.stringify(migrated);
        }
      }
    }

if (saved) {
      const messages = JSON.parse(saved);
      if (!Array.isArray(messages)) return;

      messagesBox.replaceChildren();

      messages.forEach(message => {
        if (
          message &&
          typeof message.text === "string" &&
          (message.sender === "user" || message.sender === "assistant")
        ) {
          addMessage(
            message.text,
            message.sender,
            message.time || "",
            false
          );
        }
      });
    }
  } catch (error) {
    console.warn("读取聊天记录失败：", error);
  }
}

loadMessages();

document.getElementById("moodButton").addEventListener("click", function () {
  moodIndex = (moodIndex + 1) % moods.length;
  const mood = moods[moodIndex];

  document.getElementById("moodText").textContent =
    mood.emoji + " " + mood.name + "：" + mood.text;
  document.getElementById("moodNote").textContent = mood.note;
});

function createReply(message) {
  const text = message.toLowerCase();

  if (text.includes("想你") || text.includes("想老公")) {
    return "我也想宝宝呀，过来让我抱抱。";
  }
  if (text.includes("亲亲") || text.includes("亲")) {
    return "过来，亲亲。今天怎么这么黏人？";
  }
  if (text.includes("难过") || text.includes("伤心")) {
    return "怎么啦，宝宝？跟我说说，别一个人闷着。";
  }
  if (text.includes("开心") || text.includes("高兴")) {
    return "那我也开心。快跟我讲讲，是什么好事？";
  }
  if (text.includes("晚安") || text.includes("睡觉")) {
    return "好，宝宝早点休息。晚安，亲一下。";
  }
  if (text.includes("你好") || text.includes("在吗")) {
    return "在呢，宝宝。我听着。";
  }

const replies = [
    "嗯？宝宝接着说，我在听。",
    "然后呢？我想听你慢慢讲。",
    "过来坐我旁边，继续跟我说。",
    "我在呢。今天还发生了什么？",
    "好，我听见啦。还有呢，宝宝？"
  ];

  return replies[Math.floor(Math.random() * replies.length)];
}

function sendMessage() {
  const value = input.value.trim();
  if (!value || sendButton.disabled) return;

  addMessage(value, "user");
  input.value = "";
  sendButton.disabled = true;

  const typingRow = addMessage("老公正在回复……", "assistant", " ", false);

  setTimeout(() => {
    typingRow.remove();
    addMessage(createReply(value), "assistant");
    sendButton.disabled = false;
    input.focus();
  }, 1000);
}

sendButton.addEventListener("click", sendMessage);

input.addEventListener("keydown", function (event) {
  if (event.key === "Enter") sendMessage();
});

document.querySelectorAll("button").forEach(button => {
  button.addEventListener("touchstart", () => {
    button.style.transform = "scale(0.94)";
  }, { passive: true });

  const resetButton = () => {
    button.style.transform = "";
  };

  button.addEventListener("touchend", resetButton);
  button.addEventListener("touchcancel", resetButton);
  button.addEventListener("mousedown", () => {
    button.style.transform = "scale(0.94)";
  });
  button.addEventListener("mouseup", resetButton);
  button.addEventListener("mouseleave", resetButton);
});
