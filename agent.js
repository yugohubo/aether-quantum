// AetherQuantum - NLP Agent & Quantum Gate Compiler
// Parses natural language instructions, compiles them to circuit gates, and returns a detailed Chain of Thought.

export const AGENT_MISSIONS = [
    {
        id: "bell_state",
        title: "Bell State (Entanglement)",
        description: "Entangle two qubits in the EPR state (|00> + |11>) / sqrt(2).",
        query: "bell state"
    },
    {
        id: "ghz_state",
        title: "GHZ State (3-Qubit Entanglement)",
        description: "Create a maximally entangled 3-qubit Greenberger-Horne-Zeilinger state.",
        query: "ghz state"
    },
    {
        id: "grover_search",
        title: "Grover's Search (2-Qubits)",
        description: "Amplify the amplitude of a target state (|11>) using quantum search.",
        query: "grover's search for 11"
    },
    {
        id: "dj_balanced",
        title: "Deutsch-Jozsa (Balanced)",
        description: "Determine if a function is balanced in 1 query using quantum interference.",
        query: "deutsch jozsa balanced"
    },
    {
        id: "dj_constant",
        title: "Deutsch-Jozsa (Constant)",
        description: "Determine if a function is constant in 1 query using quantum interference.",
        query: "deutsch jozsa constant"
    },
    {
        id: "teleportation",
        title: "Quantum Teleportation",
        description: "Teleport a state prepared on q0 to q2 using an entangled channel on q1 and q2.",
        query: "quantum teleportation"
    }
];

export function processAgentQuery(query) {
    const q = query.toLowerCase().trim();
    
    // Default response structure
    const response = {
        gates: [],
        thought: "",
        explanation: "",
        agentStatus: "success",
        compiledCode: ""
    };

    // 1. Bell State / Entanglement
    if (q.includes("bell") || q.includes("entangle") || q.includes("dolanık") || q.includes("dolanıklık")) {
        // Find which qubits if specified, default to 0 and 1
        let q0 = 0, q1 = 1;
        const matches = q.match(/\d+/g);
        if (matches && matches.length >= 2) {
            q0 = parseInt(matches[0]);
            q1 = parseInt(matches[1]);
        }

        response.gates = [
            { gate: "h", target: q0, controls: [] },
            { gate: "x", target: q1, controls: [q0] } // CNOT(q0 -> q1)
        ];

        response.thought = `
            <div class="thought-step"><strong>Adım 1:</strong> Qubit ${q0} üzerinde Hadamard (H) kapısı uygulayarak onu |0⟩ ve |1⟩ süperpozisyon durumuna getirdim.</div>
            <div class="thought-step"><strong>Adım 2:</strong> Qubit ${q0} kontrol, Qubit ${q1} hedef olacak şekilde bir CNOT (Controlled-NOT) kapısı yerleştirerek süperpozisyonu dolanıklık durumuna genişlettim.</div>
            <div class="thought-step"><strong>Sonuç:</strong> EPR çifti oluşturuldu. Formül: (|00⟩ + |11⟩) / √2. Artık bu iki qubit uzayda ne kadar uzakta olursa olsun anında ilişkilidir!</div>
        `;

        response.explanation = `
            <strong>Bell Durumu (Kuantum Dolanıklık):</strong> Kuantum mekaniğinin en büyüleyici fenomenidir. 
            Burada uygulanan Hadamard kapısı <em>q${q0}</em> qubitini <code>1/√2(|0⟩ + |1⟩)</code> durumuna sokar. 
            Ardından gelen CNOT kapısı, kontrol qubiti 1 olduğunda hedef qubiti çevirir. 
            Böylece sistem <code>1/√2(|00⟩ + |11⟩)</code> durumuna çöker. 
            Ölçüm yapıldığında ya ikisi birden '00' ya da ikisi birden '11' çıkacaktır; asla biri 0 diğeri 1 olamaz!
        `;
        
        response.compiledCode = `// Bell State Compilation\nqc.h(${q0});\nqc.cx(${q0}, ${q1});`;
        return response;
    }

    // 2. GHZ State (3-Qubits Entanglement)
    if (q.includes("ghz") || q.includes("3 qubit") || q.includes("3-qubit")) {
        response.gates = [
            { gate: "h", target: 0, controls: [] },
            { gate: "x", target: 1, controls: [0] },
            { gate: "x", target: 2, controls: [1] }
        ];

        response.thought = `
            <div class="thought-step"><strong>Adım 1:</strong> Qubit 0'a Hadamard uygulandı. Süperpozisyon: (|0⟩ + |1⟩)/√2.</div>
            <div class="thought-step"><strong>Adım 2:</strong> CNOT(q0 → q1) uygulanarak 2 qubit dolanık hale getirildi: (|00⟩ + |11⟩)/√2.</div>
            <div class="thought-step"><strong>Adım 3:</strong> CNOT(q1 → q2) uygulanarak dolanıklık üçüncü qubite aktarıldı: (|000⟩ + |111⟩)/√2.</div>
        `;

        response.explanation = `
            <strong>GHZ Durumu (Greenberger-Horne-Zeilinger):</strong> Çoklu qubit dolanıklığının temel örneğidir. 
            3 qubitin makroskobik ölçekte süperpozisyonda dolanık olmasını sağlar. 
            Klasik fizikle açıklanamayan kuantum uyumsuzluğu ve Bell teoremi testlerinde kritik öneme sahiptir.
            Ölçüm yapıldığında ya 000 ya da 111 durumunu elde edeceksiniz.
        `;

        response.compiledCode = `// GHZ State Compilation\nqc.h(0);\nqc.cx(0, 1);\nqc.cx(1, 2);`;
        return response;
    }

    // 3. Grover's Search for |11>
    if (q.includes("grover") || q.includes("search") || q.includes("arama")) {
        response.gates = [
            // Initialization to superposition
            { gate: "h", target: 0, controls: [] },
            { gate: "h", target: 1, controls: [] },
            // Oracle for |11> (Controlled Z)
            { gate: "z", target: 1, controls: [0] },
            // Diffuser (Amplitude Amplification)
            { gate: "h", target: 0, controls: [] },
            { gate: "h", target: 1, controls: [] },
            { gate: "x", target: 0, controls: [] },
            { gate: "x", target: 1, controls: [] },
            { gate: "z", target: 1, controls: [0] }, // CZ gate
            { gate: "x", target: 0, controls: [] },
            { gate: "x", target: 1, controls: [] },
            { gate: "h", target: 0, controls: [] },
            { gate: "h", target: 1, controls: [] }
        ];

        response.thought = `
            <div class="thought-step"><strong>Adım 1: Initialize:</strong> H(q0) ve H(q1) ile tüm olası durumların (|00⟩, |01⟩, |10⟩, |11⟩) süperpozisyonunu oluşturduk.</div>
            <div class="thought-step"><strong>Adım 2: Oracle:</strong> CZ(q0 → q1) uygulayarak aradığımız |11⟩ durumunun fazını tersine çevirdik (-|11⟩). Diğer durumlar aynı kaldı.</div>
            <div class="thought-step"><strong>Adım 3: Diffuser:</strong> H ve X kapıları ile CZ uygulamasını çevreleyerek ortalamaya göre yansıma (yansıtma) gerçekleştirdik. Bu işlem |11⟩ durumunun genliğini yükseltirken diğerlerini sıfırlar.</div>
        `;

        response.explanation = `
            <strong>Grover Arama Algoritması (2 Qubit):</strong> Yapılandırılmamış veri tabanlarında arama hızını karekök seviyesinde (O(√N)) hızlandırır.
            2 qubitlik bu devrede, süperpozisyon içinden aranan <code>|11⟩</code> durumunu tek bir adımda (Oracle + Diffuser) genlik yükseltme (amplitude amplification) yöntemiyle %100 olasılığa ulaştırırız.
            Ölçüm yaptığınızda kesin olarak 11 sonucunu alacaksınız!
        `;

        response.compiledCode = `// Grover's Search for |11>\n// 1. Uniform Superposition\nqc.h(0);\nqc.h(1);\n// 2. Oracle (CZ)\nqc.cz(0, 1);\n// 3. Diffuser\nqc.h(0); qc.h(1);\nqc.x(0); qc.x(1);\nqc.cz(0, 1);\nqc.x(0); qc.x(1);\nqc.h(0); qc.h(1);`;
        return response;
    }

    // 4. Deutsch-Jozsa Balanced
    if (q.includes("jozsa balanced") || q.includes("jozsa dengeli") || (q.includes("dj") && q.includes("balanced")) || (q.includes("dj") && q.includes("dengeli"))) {
        response.gates = [
            // Prepare inputs
            { gate: "x", target: 1, controls: [] }, // q1 -> |1>
            { gate: "h", target: 0, controls: [] }, // q0 -> |+>
            { gate: "h", target: 1, controls: [] }, // q1 -> |->
            // Balanced Oracle: f(x) = x -> CNOT from q0 to q1
            { gate: "x", target: 1, controls: [0] },
            // Final interference
            { gate: "h", target: 0, controls: [] }
        ];

        response.thought = `
            <div class="thought-step"><strong>Adım 1: Hazırlık:</strong> Qubit 1'i X ile |1⟩ yaptık. Sonra her ikisine H uygulayarak girdi (|+) ve yardımcı/ancilla (|-) durumunu kurduk.</div>
            <div class="thought-step"><strong>Adım 2: Dengeli Kehanet (Balanced Oracle):</strong> f(x) = x fonksiyonu için CNOT(q0 → q1) kapısı yerleştirdik. Bu durum 'faz geri tepmesi' (phase kickback) yaratarak q0 qubitine bir eksi faz kazandırır.</div>
            <div class="thought-step"><strong>Adım 3: Girişim:</strong> q0'a tekrar H uygulayarak fazı tekrar hesaplama bazına taşıdık.</div>
        `;

        response.explanation = `
            <strong>Deutsch-Jozsa Algoritması (Dengeli Fonksiyon):</strong> Kuantum bilişimin klasik bilgisayarlara üstünlüğünü kanıtlayan ilk algoritmadır.
            Klasik olarak fonksiyonun sabit mi dengeli mi olduğunu anlamak için f(0) ve f(1)'i ayrı ayrı hesaplamamız gerekir (2 sorgu).
            Deutsch-Jozsa ile tek bir kuantum sorgusuyla f(0) ⊕ f(1) hesaplanır. 
            Burada <em>q0</em> qubitinin ölçüm sonucu <strong>|1⟩</strong> çıkarsa fonksiyon dengeli, <strong>|0⟩</strong> çıkarsa sabittir. 
            CNOT faz geri tepmesi yaptığı için q0 ölçüldüğünde kesinlikle %100 olasılıkla <strong>|1⟩</strong> (yani binary '01' veya '11', q0 = 1) verecektir.
        `;

        response.compiledCode = `// Deutsch-Jozsa Balanced\nqc.x(1);\nqc.h(0); qc.h(1);\n// Balanced Oracle f(x) = x\nqc.cx(0, 1);\nqc.h(0);`;
        return response;
    }

    // 5. Deutsch-Jozsa Constant
    if (q.includes("jozsa constant") || q.includes("jozsa sabit") || (q.includes("dj") && q.includes("constant")) || (q.includes("dj") && q.includes("sabit"))) {
        response.gates = [
            // Prepare inputs
            { gate: "x", target: 1, controls: [] }, // q1 -> |1>
            { gate: "h", target: 0, controls: [] }, // q0 -> |+>
            { gate: "h", target: 1, controls: [] }, // q1 -> |->
            // Constant Oracle: f(x) = 0 -> No gates (identity)
            // Final interference
            { gate: "h", target: 0, controls: [] }
        ];

        response.thought = `
            <div class="thought-step"><strong>Adım 1: Hazırlık:</strong> Qubit 1'i X ile |1⟩ yaptık. H kapıları ile |+⟩ ve |-⟩ durumlarını kurduk.</div>
            <div class="thought-step"><strong>Adım 2: Sabit Kehanet (Constant Oracle):</strong> f(x) = 0 fonksiyonu için hiçbir kapı uygulamıyoruz (Birim kapısı). Bu durum faz geri tepmesi üretmez.</div>
            <div class="thought-step"><strong>Adım 3: Girişim:</strong> q0'a tekrar H uygulayarak fazı hesaplama bazına geri getirdik.</div>
        `;

        response.explanation = `
            <strong>Deutsch-Jozsa Algoritması (Sabit Fonksiyon):</strong> 
            Sabit fonksiyonda oracle hiçbir işlem yapmaz. 
            Süperpozisyondaki q0 qubiti son Hadamard kapısıyla tekrar <strong>|0⟩</strong> durumuna çöker.
            Ölçüm yapıldığında q0 her zaman 0 çıkacaktır (yani '00' veya '10', q0 = 0). 
            Tek bir sorguda sonucun |0⟩ çıkması, fonksiyonun kesinlikle sabit olduğunu kanıtlar!
        `;

        response.compiledCode = `// Deutsch-Jozsa Constant\nqc.x(1);\nqc.h(0); qc.h(1);\n// Constant Oracle f(x) = 0 (No gates)\nqc.h(0);`;
        return response;
    }

    // 6. Quantum Teleportation
    if (q.includes("teleport") || q.includes("teleportation") || q.includes("ışınlama") || q.includes("ışınla")) {
        response.gates = [
            // Step 1: Prepare state on q0 to teleport (e.g. Rx(pi/3) + Ry(pi/4))
            { gate: "rx", target: 0, controls: [], theta: Math.PI / 3 },
            { gate: "ry", target: 0, controls: [], theta: Math.PI / 4 },
            // Step 2: Create entangled channel between q1 and q2
            { gate: "h", target: 1, controls: [] },
            { gate: "x", target: 2, controls: [1] },
            // Step 3: Alice performs Bell measurement on q0 and q1
            { gate: "x", target: 1, controls: [0] },
            { gate: "h", target: 0, controls: [] },
            // Step 4: Bob applies conditional gates based on q0 and q1 measurements
            // Bob's qubit is q2
            { gate: "x", target: 2, controls: [1] }, // CNOT(q1 -> q2)
            { gate: "z", target: 2, controls: [0] }  // CZ(q0 -> q2)
        ];

        response.thought = `
            <div class="thought-step"><strong>Adım 1: Hazırlık:</strong> Qubit 0 üzerinde Rx ve Ry rotasyon kapıları uygulayarak ışınlanacak özel bir |ψ⟩ durumu hazırladım.</div>
            <div class="thought-step"><strong>Adım 2: Dolanık Kanal:</strong> Alice (q1) ve Bob (q2) arasında H ve CNOT ile dolanık bir EPR kanalı oluşturduk.</div>
            <div class="thought-step"><strong>Adım 3: Alice'in Ölçümü:</strong> Alice, kendi iki qubitine CNOT ve H uygulayarak Bell bazında ölçüm hazırlar. Bu işlem durumları dolandırır.</div>
            <div class="thought-step"><strong>Adım 4: Bob'un Düzeltmeleri:</strong> Alice'in ölçtüğü 4 olası duruma göre Bob kendi qubiti (q2) üzerinde CNOT ve CZ ile düzeltmeler uygular. Sonuçta |ψ⟩ durumu Bob'a ışınlanır!</div>
        `;

        response.explanation = `
            <strong>Kuantum Işınlama (Quantum Teleportation):</strong> Bilgiyi (maddeyi değil) kuantum dolanıklık ve klasik iletişim kullanarak bir yerden diğerine aktarma tekniğidir.
            Alice, ışınlanacak <em>q0</em> qubitinin durumunu, paylaşılan dolanık <em>q1</em> yardımıyla Bob'un <em>q2</em> qubitine aktarır.
            En sonda uygulanan CNOT ve CZ düzeltmeleri Bob'un qubitini Alice'in en baştaki orijinal <em>q0</em> durumunun aynısına dönüştürür.
            Bob'un qubitinin durumunu incelediğinizde Alice'in baştaki durumunun birebir aynısını kopyaladığını (ve Alice'in orijinal qubitinin çöktüğünü) görebilirsiniz (No-Cloning Theorem).
        `;

        response.compiledCode = `// Quantum Teleportation\n// 1. Prepare state to teleport on q0\nqc.rx(0, ${Math.PI/3});\nqc.ry(0, ${Math.PI/4});\n// 2. Bell pair on q1 and q2\nqc.h(1);\nqc.cx(1, 2);\n// 3. Alice operation\nqc.cx(0, 1);\nqc.h(0);\n// 4. Bob correction\nqc.cx(1, 2);\nqc.cz(0, 2);`;
        return response;
    }

    // 7. Superposition / Single Hadamard
    if (q.includes("superposition") || q.includes("süperpozisyon") || q.includes("h gate") || q.includes("hadamard")) {
        let qubit = 0;
        const match = q.match(/\d+/);
        if (match) {
            qubit = parseInt(match[0]);
        }

        response.gates = [
            { gate: "h", target: qubit, controls: [] }
        ];

        response.thought = `
            <div class="thought-step"><strong>Adım 1:</strong> Qubit ${qubit} üzerinde Hadamard (H) kapısı uygulayarak onu |0⟩ baz durumundan çıkardım.</div>
            <div class="thought-step"><strong>Sonuç:</strong> Qubit artık aynı anda hem 0 hem de 1 durumundadır: (|0⟩ + |1⟩)/√2.</div>
        `;

        response.explanation = `
            <strong>Süperpozisyon (Superposition):</strong> Bir kuantum sisteminin aynı anda birden fazla fiziksel durumda bulunabilme yeteneğidir.
            Hadamard kapısı qubitin Riemann/Bloch Küresi üzerindeki Z ekseninden X eksenine geçiş yapmasını sağlar. 
            Bu işlem, qubit üzerinde %50 olasılıkla 0, %50 olasılıkla 1 ölçüm sonucunun alınacağı mükemmel bir yazı-tura durumu yaratır.
        `;

        response.compiledCode = `// Superposition on Qubit ${qubit}\nqc.h(${qubit});`;
        return response;
    }

    // 8. Single qubit rotation / custom gate
    if (q.includes("rotation") || q.includes("dönüş") || q.includes("rotasyon")) {
        let qubit = 0;
        let axis = "x";
        let angle = Math.PI / 2;

        const matchQ = q.match(/q(\d+)/) || q.match(/qubit\s*(\d+)/) || q.match(/\b([0-3])\b/);
        if (matchQ) qubit = parseInt(matchQ[1]);

        if (q.includes("ry") || q.includes("y eksen") || q.includes("y axis")) axis = "y";
        if (q.includes("rz") || q.includes("z eksen") || q.includes("z axis")) axis = "z";

        const matchA = q.match(/pi\s*\/\s*(\d+)/) || q.match(/(\d+\.?\d*)/);
        if (matchA) {
            if (q.includes("pi/")) {
                angle = Math.PI / parseFloat(matchA[1]);
            } else {
                angle = parseFloat(matchA[1]);
            }
        }

        response.gates = [
            { gate: axis, target: qubit, controls: [], theta: angle }
        ];

        response.thought = `
            <div class="thought-step"><strong>Adım 1:</strong> Qubit ${qubit} üzerinde ${axis.toUpperCase()} ekseni etrafında ${angle.toFixed(4)} radyanlık bir rotasyon kapısı uyguladım.</div>
        `;

        response.explanation = `
            <strong>Qubit Rotasyonları:</strong> Bir qubitin durumunu Bloch Küresi üzerinde sürekli açılarla döndürmemizi sağlar. 
            Bu, klasik bilgisayarlardaki sadece 0 ve 1 değerlerinin aksine, kuantum bilgisayarların neden sonsuz olasılıkta ara durumları barındırabildiğini gösterir.
        `;

        response.compiledCode = `// Rotation on Qubit ${qubit}\nqc.r${axis}(${qubit}, ${angle.toFixed(4)});`;
        return response;
    }

    // 9. Reset / Clear
    if (q.includes("clear") || q.includes("reset") || q.includes("temizle") || q.includes("sıfırla")) {
        response.gates = [];
        response.thought = `<div class="thought-step">Sistem laboratuvarı sıfırlandı. Tüm qubitler |0000⟩ başlangıç durumuna getirildi.</div>`;
        response.explanation = `Tüm kuantum devresi ve kapıları temizlendi. Quantum register baştan başlatıldı.`;
        response.compiledCode = `// Register reset\nqc.reset();`;
        return response;
    }

    // Fallback - Default response if not recognized
    response.thought = `<div class="thought-step">Sorgunuzu tam olarak kuantum terimlerine çeviremedim. Ancak kuantum durumlarını keşfetmeniz için size <strong>Bell Dolanıklık Durumunu</strong> hazırladım!</div>`;
    response.explanation = `Ajan henüz bu özel komutu derleyemedi, ancak sol taraftaki 'Quantum Missions' menüsünden hazır şablonları deneyebilir veya "bell state", "grover" gibi anahtar kelimeleri kullanabilirsiniz.`;
    response.gates = [
        { gate: "h", target: 0, controls: [] },
        { gate: "x", target: 1, controls: [0] }
    ];
    response.compiledCode = `// Default EPR State\nqc.h(0);\nqc.cx(0, 1);`;
    
    return response;
}
