async function load() {
  const data = await (await fetch("/panel/state")).json();

  document.querySelector(`input[name="dayNight"][value="${data.dayNight}"]`).checked = true;
  document.querySelector(`input[name="light"][value="${data.light}"]`).checked = true;
  document.querySelector(`input[name="door"][value="${data.door}"]`).checked = true;

  document.getElementById("autoType").value = data.autoMode.type;
  document.getElementById("interval").value = data.autoMode.intervalSeconds;
}

async function save() {
  const body = {
    dayNight: document.querySelector('input[name="dayNight"]:checked').value,
    light: document.querySelector('input[name="light"]:checked').value,
    door: document.querySelector('input[name="door"]:checked').value,
    autoMode: {
      type: document.getElementById("autoType").value,
      intervalSeconds: Number(document.getElementById("interval").value)
    }
  };

  await fetch("/panel/state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  alert("Choices pushed to Build Logic! Please power the GET node on the transmitter!");
    console.log("Choices pushed to Build Logic!");
}

load();
