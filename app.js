// AetherQuantum - UI Controller & Orchestrator
import { Complex, QuantumRegister } from './quantum.js';
import { processAgentQuery, AGENT_MISSIONS } from './agent.js';

// Application State
let circuitGates = [
    { gate: "h", target: 0, controls: [] },
    { gate: "x", target: 1, controls: [0] } // Default EPR Bell State
];

const qr = new QuantumRegister(4); // 4 Qubits simulator register

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');
const cotSteps = document.getElementById('cot-steps');
const missionsList = document.getElementById('missions-list');
const circuitSvg = document.getElementById('circuit-svg');
const gateCountLabel = document.getElementById('gate-count-label');
const selectGate = document.getElementById('select-gate');
const selectTarget = document.getElementById('select-target');
const selectControl = document.getElementById('select-control');
const btnAddGate = document.getElementById('btn-add-gate');
const btnClear = document.getElementById('btn-clear');
const btnRun = document.getElementById('btn-run');
const phaseWheelGrid = document.getElementById('phase-wheel-grid');
const theoryText = document.getElementById('theory-text');
const statevectorRows = document.getElementById('statevector-rows');
const histogramChart = document.getElementById('histogram-chart');
const coherenceValue = document.getElementById('coherence-value');
const agentSubstatus = document.getElementById('agent-substatus');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initMissions();
    initUIControls();
    
    // Initial run
    runSimulation();
    
    // Welcome message and telemetry
    simulateTelemetry();
});

// Populate Missions
function initMissions() {
    missionsList.innerHTML = '';
    AGENT_MISSIONS.forEach(mission => {
        const card = document.createElement('button');
        card.className = 'mission-card';
        card.innerHTML = `
            <h5>${mission.title}</h5>
            <p>${mission.description}</p>
        `;
        card.addEventListener('click', () => {
            executeAgentMission(mission.query);
        });
        missionsList.appendChild(card);
    });
}

// Bind UI Events
function initUIControls() {
    // Add Gate
    btnAddGate.addEventListener('click', () => {
        const gateType = selectGate.value;
        const targetVal = parseInt(selectTarget.value);
        const controlVal = selectControl.value;

        let controls = [];
        if (gateType === 'CX') {
            if (controlVal === 'none') {
                addMessage('agent', 'Hata: CX (CNOT) kapısı uygulamak için lütfen bir Kontrol qubiti seçin.');
                return;
            }
            const ctrl = parseInt(controlVal);
            if (ctrl === targetVal) {
                addMessage('agent', 'Hata: Kontrol ve Hedef qubitleri aynı olamaz.');
                return;
            }
            controls = [ctrl];
        } else if (gateType === 'CCX') {
            // Toffoli - Needs 2 controls. Let's auto-assign the other 2 distinct qubits as controls
            const ctrl1 = parseInt(controlVal === 'none' ? '0' : controlVal);
            let ctrl2 = 0;
            // Find another qubit different from target and ctrl1
            for (let q = 0; q < 4; q++) {
                if (q !== targetVal && q !== ctrl1) {
                    ctrl2 = q;
                    break;
                }
            }
            if (ctrl1 === targetVal) {
                addMessage('agent', 'Hata: Kontrol qubiti ile Hedef qubiti aynı olamaz.');
                return;
            }
            controls = [ctrl1, ctrl2];
        }

        const newGate = {
            gate: gateType === 'CX' || gateType === 'CCX' ? 'x' : gateType.toLowerCase(),
            target: targetVal,
            controls: controls
        };

        circuitGates.push(newGate);
        renderCircuit();
        runSimulation();
        simulateTelemetry();
        
        theoryText.innerHTML = `
            <h5>Manuel Kapı Eklendi: ${gateType}</h5>
            <p>Qubit ${targetVal} üzerinde ${gateType} kapısı eklendi. ${controls.length > 0 ? `Kontroller: Qubit ${controls.join(', ')}` : 'Kontrol yok.'}</p>
        `;
    });

    // Clear Circuit
    btnClear.addEventListener('click', () => {
        circuitGates = [];
        renderCircuit();
        runSimulation();
        theoryText.innerHTML = `
            <h5>Devre Sıfırlandı</h5>
            <p>Tüm kapılar temizlendi. Qubitler |0000> baz durumuna geri getirildi.</p>
        `;
    });

    // Run Simulation
    btnRun.addEventListener('click', () => {
        runSimulation();
        simulateTelemetry();
    });

    // Chat events
    chatSendBtn.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
}

// Render SVG Circuit Diagram
function renderCircuit() {
    gateCountLabel.textContent = `Kapı Sayısı: ${circuitGates.length}`;
    circuitSvg.innerHTML = '';
    
    const svgWidth = Math.max(600, 100 + circuitGates.length * 60);
    circuitSvg.setAttribute('width', svgWidth);
    
    // Render Qubit Wires
    for (let q = 0; q < 4; q++) {
        const y = 30 + q * 40;
        
        // Label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '20');
        text.setAttribute('y', (y + 4).toString());
        text.setAttribute('class', 'qubit-label');
        text.textContent = `q${q}`;
        circuitSvg.appendChild(text);
        
        // Wire Line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '50');
        line.setAttribute('y1', y.toString());
        line.setAttribute('x2', svgWidth.toString());
        line.setAttribute('y2', y.toString());
        line.setAttribute('class', 'qubit-line');
        circuitSvg.appendChild(line);
    }
    
    // Render Gates
    circuitGates.forEach((gate, index) => {
        const x = 70 + index * 55;
        const targetY = 30 + gate.target * 40;
        
        if (gate.controls.length === 0) {
            // Single Qubit Gate (H, X, Y, Z, S, T, etc.)
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', 'gate-group');
            group.setAttribute('title', 'Tıklayarak Kapıyı Sil');
            group.addEventListener('click', () => deleteGate(index));
            
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', (x - 16).toString());
            rect.setAttribute('y', (targetY - 16).toString());
            rect.setAttribute('width', '32');
            rect.setAttribute('height', '32');
            rect.setAttribute('class', 'gate-box');
            
            // Custom colors depending on gate
            if (gate.gate === 'h') rect.style.stroke = 'var(--neon-cyan)';
            else if (gate.gate === 'x') rect.style.stroke = 'var(--neon-purple)';
            else if (gate.gate === 'y') rect.style.stroke = 'var(--neon-magenta)';
            else if (gate.gate === 'z') rect.style.stroke = 'var(--neon-yellow)';
            else rect.style.stroke = 'var(--neon-green)';
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x.toString());
            text.setAttribute('y', targetY.toString());
            text.setAttribute('class', 'gate-text');
            
            let label = gate.gate.toUpperCase();
            if (gate.theta !== undefined) {
                label = `R${gate.gate}`;
            }
            text.textContent = label;
            
            group.appendChild(rect);
            group.appendChild(text);
            circuitSvg.appendChild(group);
            
        } else if (gate.controls.length === 1) {
            // Controlled Gate (CNOT/CX)
            const controlY = 30 + gate.controls[0] * 40;
            
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', 'gate-group');
            group.addEventListener('click', () => deleteGate(index));
            
            // Vertical connecting line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x.toString());
            line.setAttribute('y1', controlY.toString());
            line.setAttribute('x2', x.toString());
            line.setAttribute('y2', targetY.toString());
            line.setAttribute('class', 'cnot-line');
            group.appendChild(line);
            
            // Control dot
            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', x.toString());
            dot.setAttribute('cy', controlY.toString());
            dot.setAttribute('r', '5');
            dot.setAttribute('class', 'cnot-control-dot');
            group.appendChild(dot);
            
            // Target XOR ring
            const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            ring.setAttribute('cx', x.toString());
            ring.setAttribute('cy', targetY.toString());
            ring.setAttribute('r', '10');
            ring.setAttribute('class', 'cnot-target-ring');
            group.appendChild(ring);
            
            // Plus cross inside ring
            const crossH = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            crossH.setAttribute('x1', (x - 7).toString());
            crossH.setAttribute('y1', targetY.toString());
            crossH.setAttribute('x2', (x + 7).toString());
            crossH.setAttribute('y2', targetY.toString());
            crossH.setAttribute('class', 'cnot-target-cross');
            
            const crossV = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            crossV.setAttribute('x1', x.toString());
            crossV.setAttribute('y1', (targetY - 7).toString());
            crossV.setAttribute('x2', x.toString());
            crossV.setAttribute('y2', (targetY + 7).toString());
            crossV.setAttribute('class', 'cnot-target-cross');
            
            group.appendChild(crossH);
            group.appendChild(crossV);
            circuitSvg.appendChild(group);
            
        } else if (gate.controls.length >= 2) {
            // Multi-Controlled Gate (Toffoli/CCX)
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', 'gate-group');
            group.addEventListener('click', () => deleteGate(index));
            
            const ctrlY1 = 30 + gate.controls[0] * 40;
            const ctrlY2 = 30 + gate.controls[1] * 40;
            const yMin = Math.min(ctrlY1, ctrlY2, targetY);
            const yMax = Math.max(ctrlY1, ctrlY2, targetY);
            
            // Vertical connecting line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x.toString());
            line.setAttribute('y1', yMin.toString());
            line.setAttribute('x2', x.toString());
            line.setAttribute('y2', yMax.toString());
            line.setAttribute('class', 'cnot-line');
            line.style.stroke = 'var(--neon-magenta)';
            group.appendChild(line);
            
            // Control dots
            const dot1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot1.setAttribute('cx', x.toString());
            dot1.setAttribute('cy', ctrlY1.toString());
            dot1.setAttribute('r', '5');
            dot1.setAttribute('class', 'cnot-control-dot');
            dot1.style.fill = 'var(--neon-magenta)';
            
            const dot2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot2.setAttribute('cx', x.toString());
            dot2.setAttribute('cy', ctrlY2.toString());
            dot2.setAttribute('r', '5');
            dot2.setAttribute('class', 'cnot-control-dot');
            dot2.style.fill = 'var(--neon-magenta)';
            
            group.appendChild(dot1);
            group.appendChild(dot2);
            
            // Target XOR ring
            const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            ring.setAttribute('cx', x.toString());
            ring.setAttribute('cy', targetY.toString());
            ring.setAttribute('r', '10');
            ring.setAttribute('class', 'cnot-target-ring');
            ring.style.stroke = 'var(--neon-magenta)';
            group.appendChild(ring);
            
            // Plus cross inside ring
            const crossH = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            crossH.setAttribute('x1', (x - 7).toString());
            crossH.setAttribute('y1', targetY.toString());
            crossH.setAttribute('x2', (x + 7).toString());
            crossH.setAttribute('y2', targetY.toString());
            crossH.setAttribute('class', 'cnot-target-cross');
            crossH.style.stroke = 'var(--neon-magenta)';
            
            const crossV = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            crossV.setAttribute('x1', x.toString());
            crossV.setAttribute('y1', (targetY - 7).toString());
            crossV.setAttribute('x2', x.toString());
            crossV.setAttribute('y2', (targetY + 7).toString());
            crossV.setAttribute('class', 'cnot-target-cross');
            crossV.style.stroke = 'var(--neon-magenta)';
            
            group.appendChild(crossH);
            group.appendChild(crossV);
            circuitSvg.appendChild(group);
        }
    });
}

// Delete specific gate by index
function deleteGate(index) {
    circuitGates.splice(index, 1);
    renderCircuit();
    runSimulation();
    simulateTelemetry();
    theoryText.innerHTML = `
        <h5>Kapı Kaldırıldı</h5>
        <p>Kuantum devresinden kapı silindi. Kuantum dalga fonksiyonu gerçek zamanlı olarak yeniden hesaplandı.</p>
    `;
}

// Execute Simulation
function runSimulation() {
    qr.reset();
    
    // Apply all gates
    for (const gate of circuitGates) {
        const type = gate.gate.toLowerCase();
        const t = gate.target;
        const ctrls = gate.controls;
        
        if (type === 'h') qr.h(t, ctrls);
        else if (type === 'x') qr.x(t, ctrls);
        else if (type === 'y') qr.y(t, ctrls);
        else if (type === 'z') qr.z(t, ctrls);
        else if (type === 's') qr.s(t, ctrls);
        else if (type === 't') qr.t(t, ctrls);
        else if (type === 'rx') qr.rx(t, gate.theta !== undefined ? gate.theta : Math.PI/2, ctrls);
        else if (type === 'ry') qr.ry(t, gate.theta !== undefined ? gate.theta : Math.PI/2, ctrls);
        else if (type === 'rz') qr.rz(t, gate.theta !== undefined ? gate.theta : Math.PI/2, ctrls);
    }
    
    renderResults();
}

// Render simulation results
function renderResults() {
    const probs = qr.getProbabilities();
    const sv = qr.statevector;
    
    // 1. Render Statevector Table
    statevectorRows.innerHTML = '';
    let nonZeroCount = 0;
    
    for (let i = 0; i < 16; i++) {
        const prob = probs[i];
        const amplitude = sv[i];
        const label = qr.formatStateLabel(i);
        const hasProb = prob > 0.0001;
        
        if (hasProb) nonZeroCount++;
        
        const row = document.createElement('div');
        row.className = `statevector-row ${hasProb ? 'non-zero' : ''}`;
        row.innerHTML = `
            <span class="sv-label">|${label}⟩</span>
            <span>${Complex.toString(amplitude, 3)}</span>
            <span>${(prob * 100).toFixed(1)}%</span>
            <div class="sv-prob-bar-bg">
                <div class="sv-prob-bar-fill" style="width: ${prob * 100}%"></div>
            </div>
        `;
        statevectorRows.appendChild(row);
    }
    
    // 2. Render Phase Wheels
    phaseWheelGrid.innerHTML = '';
    // Let's only render the first 8 states if screen is too packed, or all 16 since it is a nice grid
    // Supporting all 16 in a compact 4x4 matrix
    for (let i = 0; i < 16; i++) {
        const prob = probs[i];
        const amplitude = sv[i];
        const label = qr.formatStateLabel(i);
        const mag = Complex.magnitude(amplitude);
        const phaseRad = Complex.phase(amplitude);
        const phaseDeg = (phaseRad * 180) / Math.PI;
        
        const wheelCard = document.createElement('div');
        wheelCard.className = `phase-wheel-card ${mag > 0.01 ? 'active' : ''}`;
        
        // Amplitude circle width percentage
        const ampPercent = mag * 100;
        
        wheelCard.innerHTML = `
            <div class="phase-wheel-outer">
                <div class="phase-wheel-amplitude" style="width: ${ampPercent}%; height: ${ampPercent}%"></div>
                <div class="phase-wheel-pointer" style="transform: rotate(${phaseDeg}deg)"></div>
            </div>
            <span class="phase-wheel-label">|${label}⟩</span>
            <span class="phase-wheel-prob">${(prob * 100).toFixed(0)}%</span>
        `;
        phaseWheelGrid.appendChild(wheelCard);
    }
    
    // 3. Render Simulated Measurements (Monte Carlo 1024 shots)
    const counts = qr.sample(1024);
    histogramChart.innerHTML = '';
    
    // Sort states so they render in binary order
    const sortedStates = Object.keys(counts).sort();
    
    if (sortedStates.length === 0) {
        histogramChart.innerHTML = '<div style="color: #64748b; font-size: 0.75rem; text-align: center; padding: 20px 0;">Hiçbir olasılık tespit edilmedi.</div>';
    } else {
        sortedStates.forEach(state => {
            const count = counts[state];
            const pct = (count / 1024) * 100;
            
            const barRow = document.createElement('div');
            barRow.className = 'chart-bar-row';
            barRow.innerHTML = `
                <span class="chart-label">|${state}⟩</span>
                <div class="chart-bar-outer">
                    <div class="chart-bar-inner" style="width: ${pct}%"></div>
                </div>
                <span class="chart-value">${count} (${pct.toFixed(0)}%)</span>
            `;
            histogramChart.appendChild(barRow);
        });
    }
}

// Process Chat Message
function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    // Clear input
    chatInput.value = '';
    
    // Add user message
    addMessage('user', text);
    
    // Processing status
    agentSubstatus.textContent = 'Analiz ediliyor, kuantum kodları derleniyor...';
    
    // Simulate "Thinking" agent effect
    setTimeout(() => {
        const result = processAgentQuery(text);
        
        // Add agent response
        addMessage('agent', result.explanation);
        
        // Update Chain of Thought
        cotSteps.innerHTML = result.thought;
        
        // Set circuit and run
        circuitGates = result.gates;
        renderCircuit();
        runSimulation();
        simulateTelemetry();
        
        agentSubstatus.textContent = 'Sistem kararlı. Devre simüle edildi.';
    }, 450);
}

// Trigger predefined agent query
function executeAgentMission(query) {
    addMessage('user', `Görev Çalıştır: ${query}`);
    agentSubstatus.textContent = 'Ajan görev protokolünü başlattı...';
    
    setTimeout(() => {
        const result = processAgentQuery(query);
        addMessage('agent', result.explanation);
        cotSteps.innerHTML = result.thought;
        
        circuitGates = result.gates;
        renderCircuit();
        runSimulation();
        simulateTelemetry();
        
        agentSubstatus.textContent = 'Görev başarıyla yüklendi ve simüle edildi.';
    }, 400);
}

// Add message to chat panel
function addMessage(sender, htmlText) {
    const msg = document.createElement('div');
    msg.className = `message ${sender}`;
    msg.innerHTML = htmlText;
    chatMessages.appendChild(msg);
    
    // Auto Scroll
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Telemetry visual effect (Dynamic random stats)
function simulateTelemetry() {
    const coherence = (99.8 + Math.random() * 0.15).toFixed(3);
    coherenceValue.textContent = `${coherence}%`;
}
