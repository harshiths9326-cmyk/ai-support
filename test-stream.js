

async function main() {
  try {
    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] })
    });
    console.log("Status:", res.status);
    console.log("StatusText:", res.statusText);
    const body = await res.text();
    console.log("Body:", body);
  } catch (err) {
    console.error("Fetch err:", err);
  }
}
main();
