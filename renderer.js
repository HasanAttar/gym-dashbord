const form = document.getElementById('clientForm');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const regDateInput = document.getElementById('registration_date');
// const paymentStatusInput = document.getElementById('payment_status');
const tableBody = document.getElementById('clientTable');
const statsDiv = document.getElementById('stats');
const filterMonth = document.getElementById('filterMonth');

let editingClientId = null;
let clientsCache = [];

form.addEventListener('submit', async (e) => {
  e.preventDefault();

 const client = {
  name: nameInput.value,
  phone: phoneInput.value,
  registration_date: regDateInput.value,
  payment_status: 'Paid' // always paid when added
};
  if (editingClientId) {
    await window.api.updateClient({ id: editingClientId, ...client });
    editingClientId = null;
  } else {
    await window.api.addClient(client);
  }

  form.reset();
  await loadClients();
});

async function loadClients() {
  let clients = await window.api.getClients();

  // Auto-update expired clients to unpaid
  const today = new Date();
for (const client of clients) {
  const regDate = new Date(client.registration_date);
  const diffInTime = today.getTime() - regDate.getTime();
  const diffInDays = diffInTime / (1000 * 3600 * 24);
  const isExpired = diffInDays >= 30;

  if (isExpired && client.payment_status === 'Paid') {
    client.payment_status = 'Unpaid';
    await window.api.updateClient(client);

    // Auto-open WhatsApp reminder
    // sendWhatsApp(client.phone, client.name);
  }
}


  // Re-fetch clients after updates
  clients = await window.api.getClients();
  clientsCache = clients;

  // Filter by month if selected
  const selectedMonth = filterMonth.value;
  const filteredClients = selectedMonth
    ? clients.filter(c => c.registration_date.slice(5, 7) === selectedMonth)
    : clients;

  renderTable(filteredClients);
  showStats(filteredClients);
}

function renderTable(clients) {
  tableBody.innerHTML = '';
  clients.forEach(client => {
    const statusColor = client.payment_status === 'Paid' ? 'green' : 'red';

    const whatsappBtn = client.payment_status === 'Unpaid'
      ? `<button class="whatsapp" onclick="sendWhatsApp('${client.phone}', '${client.name}')">Send Reminder</button>`
      : '';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${client.name}</td>
      <td>${client.phone}</td>
      <td>${client.registration_date}</td>
      <td style="color: ${statusColor}; font-weight: bold;">${client.payment_status}</td>
      <td>
        <button class="edit" onclick="editClient(${client.id})">Edit</button>
        <button class="delete" onclick="deleteClient(${client.id})">Delete</button>
        ${whatsappBtn}
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function showStats(clients) {
  const total = clients.length;
  const paid = clients.filter(c => c.payment_status === 'Paid').length;
  const unpaid = total - paid;
  statsDiv.innerText = `Total: ${total} | Paid: ${paid} | Unpaid: ${unpaid}`;
}

window.editClient = function (id) {
  const client = clientsCache.find(c => c.id === id);
  if (!client) return;
  nameInput.value = client.name;
  phoneInput.value = client.phone;
  regDateInput.value = client.registration_date;
  // paymentStatusInput.value = client.payment_status;
  editingClientId = client.id;
};

function sendWhatsApp(phone, name) {
  const message = encodeURIComponent(`Hello ${name}, this is a reminder from your gym.`);
  const url = `https://wa.me/${phone}?text=${message}`;
  window.open(url, '_blank');
}

window.deleteClient = async function (id) {
  if (confirm('Are you sure you want to delete this client?')) {
    await window.api.deleteClient(id);
    await loadClients();
  }
};

// ✅ Ensure code runs after DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await loadClients();
});
