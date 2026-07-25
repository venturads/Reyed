const pickupInput = document.getElementById('pickup');
const destinationInput = document.getElementById('destination');
const fareEl = document.getElementById('fare');
const durationEl = document.getElementById('duration');
const requestRideBtn = document.getElementById('requestRideBtn');
const bookingView = document.getElementById('bookingView');
const activeRideView = document.getElementById('activeRideView');
const driverCard = document.getElementById('driverCard');
const advanceRideBtn = document.getElementById('advanceRideBtn');
const cancelRideBtn = document.getElementById('cancelRideBtn');
const statusBadge = document.getElementById('statusBadge');
const rideTitle = document.getElementById('rideTitle');
const rideSubtitle = document.getElementById('rideSubtitle');
const activePickup = document.getElementById('activePickup');
const activeDestination = document.getElementById('activeDestination');
const activeFare = document.getElementById('activeFare');
const activeEta = document.getElementById('activeEta');
const historyDrawer = document.getElementById('historyDrawer');
const historyList = document.getElementById('historyList');
const overlay = document.getElementById('overlay');
const toast = document.getElementById('toast');
const carMarker = document.getElementById('carMarker');

let selectedRide = { type: 'Economy', base: 4.5, mile: 1.75 };
let currentEstimate = { fare: 0, miles: 0, minutes: 0 };
let rideStage = 'idle';
let activeRide = null;

const drivers = [
  { name: 'Alex Morgan', vehicle: 'Toyota Camry', plate: '8RDN204', rating: '4.9', initials: 'AM' },
  { name: 'Jordan Lee', vehicle: 'Honda Accord', plate: '7TRP118', rating: '4.8', initials: 'JL' },
  { name: 'Taylor Brooks', vehicle: 'Hyundai Sonata', plate: '9KLM442', rating: '5.0', initials: 'TB' }
];

function pseudoDistance(a, b) {
  const seed = [...(a + b)].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Math.max(1.5, (seed % 170) / 10);
}

function updateEstimate() {
  const pickup = pickupInput.value.trim();
  const destination = destinationInput.value.trim();

  if (!pickup || !destination) {
    currentEstimate = { fare: 0, miles: 0, minutes: 0 };
    fareEl.textContent = '$0.00';
    durationEl.textContent = '—';
    return;
  }

  const miles = pseudoDistance(pickup, destination);
  const fare = selectedRide.base + miles * selectedRide.mile;
  const minutes = Math.max(5, Math.round(miles * 2.4 + 4));

  currentEstimate = { fare, miles, minutes };
  fareEl.textContent = `$${fare.toFixed(2)}`;
  durationEl.textContent = `${minutes} min`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.add('hidden'), 2300);
}

document.querySelectorAll('.ride-option').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.ride-option').forEach(item => item.classList.remove('selected'));
    button.classList.add('selected');
    selectedRide = {
      type: button.dataset.type,
      base: Number(button.dataset.base),
      mile: Number(button.dataset.mile)
    };
    updateEstimate();
  });
});

document.querySelectorAll('.quick-place').forEach(button => {
  button.addEventListener('click', () => {
    destinationInput.value = button.dataset.place;
    updateEstimate();
  });
});

pickupInput.addEventListener('input', updateEstimate);
destinationInput.addEventListener('input', updateEstimate);

requestRideBtn.addEventListener('click', () => {
  const pickup = pickupInput.value.trim();
  const destination = destinationInput.value.trim();

  if (!pickup || !destination) {
    showToast('Enter both pickup and destination.');
    return;
  }

  updateEstimate();
  activeRide = {
    id: Date.now(),
    pickup,
    destination,
    type: selectedRide.type,
    fare: currentEstimate.fare,
    minutes: currentEstimate.minutes,
    status: 'Finding driver',
    date: new Date().toLocaleString()
  };

  bookingView.classList.add('hidden');
  activeRideView.classList.remove('hidden');
  activePickup.textContent = pickup;
  activeDestination.textContent = destination;
  activeFare.textContent = `$${currentEstimate.fare.toFixed(2)}`;
  activeEta.textContent = 'Searching';
  rideStage = 'matching';
  setMatchingState();

  setTimeout(assignDriver, 2400);
});

function setMatchingState() {
  statusBadge.textContent = 'Finding a driver';
  rideTitle.textContent = 'Matching you with a nearby driver';
  rideSubtitle.textContent = 'This usually takes a few seconds.';
  driverCard.classList.add('hidden');
  advanceRideBtn.classList.add('hidden');
  cancelRideBtn.classList.remove('hidden');
}

function assignDriver() {
  if (rideStage !== 'matching') return;

  const driver = drivers[Math.floor(Math.random() * drivers.length)];
  document.querySelector('.driver-avatar').textContent = driver.initials;
  document.getElementById('driverName').textContent = driver.name;
  document.getElementById('vehicle').textContent = driver.vehicle;
  document.getElementById('plate').textContent = driver.plate;
  document.getElementById('rating').textContent = driver.rating;

  rideStage = 'assigned';
  statusBadge.textContent = 'Driver assigned';
  rideTitle.textContent = `${driver.name} is on the way`;
  rideSubtitle.textContent = 'Meet your driver at the pickup point.';
  activeEta.textContent = '4 min';
  driverCard.classList.remove('hidden');
  advanceRideBtn.classList.remove('hidden');
  advanceRideBtn.textContent = 'Start ride';
  carMarker.style.left = '36%';
  carMarker.style.top = '54%';
  activeRide.status = 'Driver assigned';
  activeRide.driver = driver.name;
  showToast('Driver found.');
}

advanceRideBtn.addEventListener('click', () => {
  if (rideStage === 'assigned') {
    rideStage = 'in_progress';
    statusBadge.textContent = 'Ride in progress';
    rideTitle.textContent = 'You are on your way';
    rideSubtitle.textContent = `Heading to ${activeRide.destination}.`;
    activeEta.textContent = `${activeRide.minutes} min`;
    advanceRideBtn.textContent = 'Complete ride';
    cancelRideBtn.classList.add('hidden');
    carMarker.style.left = '66%';
    carMarker.style.top = '30%';
    activeRide.status = 'In progress';
  } else if (rideStage === 'in_progress') {
    completeRide();
  }
});

cancelRideBtn.addEventListener('click', () => {
  if (!activeRide) return;
  activeRide.status = 'Canceled';
  saveRide(activeRide);
  resetRide();
  showToast('Ride canceled.');
});

function completeRide() {
  activeRide.status = 'Completed';
  saveRide(activeRide);
  resetRide();
  showToast('Ride completed.');
}

function resetRide() {
  rideStage = 'idle';
  bookingView.classList.remove('hidden');
  activeRideView.classList.add('hidden');
  driverCard.classList.add('hidden');
  advanceRideBtn.classList.add('hidden');
  cancelRideBtn.classList.remove('hidden');
  carMarker.style.left = '47%';
  carMarker.style.top = '46%';
  activeRide = null;
  renderHistory();
}

function saveRide(ride) {
  const history = JSON.parse(localStorage.getItem('rideNowHistory') || '[]');
  history.unshift(ride);
  localStorage.setItem('rideNowHistory', JSON.stringify(history.slice(0, 20)));
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('rideNowHistory') || '[]');

  if (!history.length) {
    historyList.innerHTML = '<p class="helper">No rides yet.</p>';
    return;
  }

  historyList.innerHTML = history.map(ride => `
    <article class="history-item">
      <strong>${escapeHtml(ride.pickup)} → ${escapeHtml(ride.destination)}</strong>
      <p>${escapeHtml(ride.type)} · $${Number(ride.fare).toFixed(2)}</p>
      <p>${escapeHtml(ride.status)} · ${escapeHtml(ride.date)}</p>
    </article>
  `).join('');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[char]);
}

function openHistory() {
  renderHistory();
  historyDrawer.classList.add('open');
  historyDrawer.setAttribute('aria-hidden', 'false');
  overlay.classList.remove('hidden');
}

function closeHistory() {
  historyDrawer.classList.remove('open');
  historyDrawer.setAttribute('aria-hidden', 'true');
  overlay.classList.add('hidden');
}

document.getElementById('historyBtn').addEventListener('click', openHistory);
document.getElementById('closeHistoryBtn').addEventListener('click', closeHistory);
overlay.addEventListener('click', closeHistory);
document.getElementById('clearHistoryBtn').addEventListener('click', () => {
  localStorage.removeItem('rideNowHistory');
  renderHistory();
  showToast('Ride history cleared.');
});

renderHistory();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('service-worker.js'));
}
