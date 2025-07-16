// ============ CLASES ============
class AFDNarrativo {
  constructor() {
    this.states = {
      'inicio': {
        description: 'Te encuentras frente a una cueva antigua cubierta de musgo. Las leyendas hablan de un tesoro perdido en sus profundidades.',
        transitions: {
          'explorar': 'entrada_cueva',
          'huir': 'final_cobarde'
        }
      },
      'entrada_cueva': {
        description: 'Has entrado en la cueva. Tus pasos resuenan en la oscuridad. Frente a ti se bifurca el camino en dos túneles.',
        transitions: {
          'izquierda': 'tunel_izquierdo',
          'derecha': 'tunel_derecho',
          'retroceder': 'inicio'
        }
      },
      'tunel_izquierdo': {
        description: 'El túnel izquierdo te lleva a una cámara subterránea con un lago cristalino. Brillan monedas de oro en el fondo.',
        transitions: {
          'nadar': 'lago_dorado',
          'buscar_bote': 'orilla_segura',
          'retroceder': 'entrada_cueva'
        }
      },
      'tunel_derecho': {
        description: 'El túnel derecho se abre a una gran sala con dos puertas ornamentadas: una dorada y otra plateada.',
        transitions: {
          'puerta_dorada': 'camara_dorada',
          'puerta_plateada': 'camara_plateada',
          'retroceder': 'entrada_cueva'
        }
      },
      'lago_dorado': {
        description: 'Nadas hacia el fondo del lago y encuentras un cofre lleno de monedas de oro. ¡Has encontrado parte del tesoro!',
        transitions: {
          'retroceder': 'tunel_izquierdo'
        },
        isFinal: true,
        finalType: 'victoria_menor'
      },
      'orilla_segura': {
        description: 'Encuentras un bote y navegas cuidadosamente por el lago. Descubres una entrada secreta que lleva a la cámara del tesoro principal.',
        transitions: {
          'explorar': 'tesoro_principal'
        }
      },
      'camara_dorada': {
        description: 'La puerta dorada se abre revelando una cámara llena de jeroglíficos antiguos. En el centro hay un pedestal con un enigma.',
        transitions: {
          'estudiar_jeroglificos': 'enigma_antiguo',
          'retroceder': 'tunel_derecho'
        }
      },
      'camara_plateada': {
        description: 'La puerta plateada conduce a una trampa. El suelo se desploma y caes en un pozo profundo.',
        transitions: {},
        isFinal: true,
        finalType: 'derrota'
      },
      'enigma_antiguo': {
        description: 'Los jeroglíficos revelan un acertijo: "Solo el sabio que comprende el pasado puede reclamar el futuro". Tienes dos opciones.',
        transitions: {
          'resolver': 'solucion_correcta',
          'adivinar': 'solucion_incorrecta'
        }
      },
      'solucion_correcta': {
        description: 'Tu sabiduría te ha llevado a la solución correcta. Una puerta secreta se abre revelando el tesoro supremo de la cueva.',
        transitions: {
          'explorar': 'tesoro_supremo'
        }
      },
      'solucion_incorrecta': {
        description: 'Tu respuesta activa una trampa antigua. Gases venenosos llenan la cámara.',
        transitions: {},
        isFinal: true,
        finalType: 'derrota'
      },
      'tesoro_principal': {
        description: 'Has encontrado la cámara principal del tesoro. Cofres llenos de oro, joyas y artefactos antiguos brillan ante tus ojos.',
        transitions: {
          'seguir_instrucciones': 'tesoro_supremo'
        },
        isFinal: true,
        finalType: 'victoria'
      },
      'tesoro_supremo': {
        description: 'Has descubierto el tesoro legendario completo. Eres ahora el maestro de la cueva y guardián de sus secretos ancestrales.',
        transitions: {},
        isFinal: true,
        finalType: 'victoria_suprema'
      },
      'final_cobarde': {
        description: 'Decides que la aventura es demasiado peligrosa y huyes. Te quedas con la duda de lo que podrías haber encontrado.',
        transitions: {},
        isFinal: true,
        finalType: 'final_neutral'
      }
    };

    this.currentState = 'inicio';
    this.visitedStates = ['inicio'];
    this.alphabet = ['explorar', 'huir', 'izquierda', 'derecha', 'retroceder', 'nadar', 'buscar_bote', 'puerta_dorada', 'puerta_plateada', 'estudiar_jeroglificos', 'resolver', 'adivinar', 'seguir_instrucciones'];
  }

  getCurrentState() {
    return this.states[this.currentState];
  }

  getAvailableTransitions() {
    return Object.keys(this.getCurrentState().transitions);
  }

  transition(input) {
    const currentStateObj = this.getCurrentState();

    if (currentStateObj.transitions[input]) {
      this.currentState = currentStateObj.transitions[input];
      if (!this.visitedStates.includes(this.currentState)) {
        this.visitedStates.push(this.currentState);
      }
      return true;
    }

    return false;
  }

  reset() {
    this.currentState = 'inicio';
    this.visitedStates = ['inicio'];
  }

  isAcceptingState() {
    return this.getCurrentState().isFinal === true;
  }

  getAllStates() {
    return Object.keys(this.states);
  }

  getTransitionsFromState(state) {
    return this.states[state] ? this.states[state].transitions : {};
  }
}

class GramaticaNarrativa {
  constructor() {
    this.rules = {
      'S': [
        ['INTRO', 'ESCENARIO', 'DETALLE_AMBIENTAL'],
        ['ACCION', 'RESULTADO', 'REACCION'],
        ['DESCRIPCION', 'OPCIONES'],
        ['MOMENTO', 'LUGAR', 'SENSACION']
      ],
      'INTRO': [
        ['Te encuentras'],
        ['De repente te hallas'],
        ['Ahora estás'],
        ['En este momento te sitúas']
      ],
      'ESCENARIO': [
        ['en una cueva misteriosa'],
        ['ante dos senderos oscuros'],
        ['frente a un lago cristalino'],
        ['en una cámara antigua'],
        ['dentro de un túnel estrecho']
      ],
      'DETALLE_AMBIENTAL': [
        ['con ecos resonando a lo lejos'],
        ['mientras el viento susurra secretos'],
        ['con cristales brillando en las paredes'],
        ['bajo la luz tenue de antorchas'],
        ['respirando aire húmedo y fresco']
      ],
      'ACCION': [
        ['Decides'],
        ['Eliges'],
        ['Optas por'],
        ['Te dispones a']
      ],
      'RESULTADO': [
        ['avanzar con cautela'],
        ['explorar los alrededores'],
        ['examinar los detalles'],
        ['seguir tu instinto']
      ],
      'REACCION': [
        ['sintiendo una mezcla de emoción y temor'],
        ['con el corazón latiendo aceleradamente'],
        ['consciente de los peligros que acechan'],
        ['esperando descubrir grandes secretos']
      ],
      'DESCRIPCION': [
        ['La atmósfera es'],
        ['El ambiente resulta'],
        ['La situación se presenta'],
        ['Todo parece']
      ],
      'OPCIONES': [
        ['llena de posibilidades infinitas'],
        ['cargada de misterio y aventura'],
        ['repleta de desafíos emocionantes'],
        ['abundante en secretos por descubrir']
      ],
      'MOMENTO': [
        ['En este instante'],
        ['Justo ahora'],
        ['Precisamente aquí'],
        ['En este preciso momento']
      ],
      'LUGAR': [
        ['en el corazón de la cueva'],
        ['en los confines del misterio'],
        ['en el epicentro de la aventura'],
        ['en el umbral del descubrimiento']
      ],
      'SENSACION': [
        ['sientes la llamada del tesoro'],
        ['percibes la magia del lugar'],
        ['experimentas una conexión ancestral'],
        ['vives la emoción de lo desconocido']
      ]
    };

    this.finalStateRules = {
      'victoria': [
        ['¡ÉXITO!', 'HAS_LOGRADO', 'CELEBRACION'],
        ['VICTORIA', 'RECOMPENSA', 'FINAL_FELIZ']
      ],
      'derrota': [
        ['FRACASO', 'CONSECUENCIA', 'REFLECCION'],
        ['TODO_TERMINA', 'PERDIDA', 'FINAL_TRISTE']
      ]
    };

    this.contextualEnhancements = {
      'inicio': ['El comienzo de una gran aventura te espera...'],
      'entrada_cueva': ['La oscuridad te envuelve mientras adentras en lo desconocido...'],
      'lago_dorado': ['El brillo dorado del agua hipnotiza tus sentidos...'],
      'tesoro_principal': ['¡El momento que has estado esperando ha llegado!'],
      'tesoro_supremo': ['Has alcanzado la gloria eterna del aventurero...']
    };
  }

  generateText(startSymbol = 'S') {
    if (!this.rules[startSymbol]) {
      return startSymbol;
    }

    const productions = this.rules[startSymbol];
    const randomProduction = productions[Math.floor(Math.random() * productions.length)];

    return randomProduction.map(symbol => {
      if (this.rules[symbol]) {
        return this.generateText(symbol);
      }
      return symbol;
    }).join(' ');
  }

  enhanceDescription(baseDescription, currentState) {
    const enhancement = this.contextualEnhancements[currentState];
    const generatedText = this.generateText();

    let result = baseDescription;

    if (enhancement) {
      result += `\n\n${enhancement[0]}`;
    }

    result += `\n\n💭 ${generatedText}`;

    return result;
  }

  getRandomRule() {
    const keys = Object.keys(this.rules);
    return keys[Math.floor(Math.random() * keys.length)];
  }

  analyzeProduction(nonTerminal) {
    if (!this.rules[nonTerminal]) {
      return null;
    }

    return {
      symbol: nonTerminal,
      productions: this.rules[nonTerminal],
      count: this.rules[nonTerminal].length
    };
  }
}

// ============ INSTANCIAS GLOBALES ============
const afd = new AFDNarrativo();
const gramatica = new GramaticaNarrativa();

// ============ FUNCIONES DEL JUEGO ============
function updateUI() {
  const currentStateObj = afd.getCurrentState();
  const storyText = document.getElementById('storyText');
  const optionsContainer = document.getElementById('optionsContainer');
  const currentStateDisplay = document.getElementById('currentState');
  const visitedStatesDisplay = document.getElementById('visitedStates');
  const possibleTransitionsDisplay = document.getElementById('possibleTransitions');
  const grammarOutputDisplay = document.getElementById('grammarOutput');

  // Actualizar descripción
  const enhancedDescription = gramatica.enhanceDescription(
    currentStateObj.description,
    afd.currentState
  );
  storyText.innerHTML = `<strong>Estado: ${afd.currentState.toUpperCase()}</strong><br><br>${enhancedDescription}`;

  // Actualizar opciones
  optionsContainer.innerHTML = '';
  const transitions = afd.getAvailableTransitions();

  if (transitions.length === 0) {
    const finalMessage = document.createElement('div');
    finalMessage.style.textAlign = 'center';
    finalMessage.style.padding = '20px';
    finalMessage.style.fontSize = '18px';
    finalMessage.style.fontWeight = 'bold';

    const finalType = currentStateObj.finalType;
    const messages = {
      'victoria': '🏆 ¡VICTORIA ÉPICA! 🏆',
      'victoria_prudente': '🎯 ¡VICTORIA INTELIGENTE! 🎯',
      'victoria_menor': '🥉 ¡VICTORIA PARCIAL! 🥉',
      'victoria_suprema': '👑 ¡VICTORIA LEGENDARIA! 👑',
      'derrota': '💀 GAME OVER 💀',
      'final_neutral': '🤔 FINAL REFLEXIVO 🤔'
    };

    finalMessage.innerHTML = messages[finalType] || '🏁 FIN DE LA AVENTURA 🏁';
    optionsContainer.appendChild(finalMessage);
  } else {
    transitions.forEach(transition => {
      const button = document.createElement('button');
      button.className = 'option-btn';
      button.textContent = `${getTransitionEmoji(transition)} ${capitalizeFirst(transition.replace('_', ' '))}`;
      button.onclick = () => makeChoice(transition);
      optionsContainer.appendChild(button);
    });
  }

  // Actualizar panel de debug
  currentStateDisplay.textContent = afd.currentState.toUpperCase();
  visitedStatesDisplay.innerHTML = afd.visitedStates.map(state =>
    `<span class="state-indicator">${state}</span>`
  ).join('');

  possibleTransitionsDisplay.textContent = transitions.length > 0 ?
    transitions.join(', ') : 'Estado final - Sin transiciones';

  // Generar nueva salida gramatical
  const grammarSample = gramatica.generateText();
  grammarOutputDisplay.innerHTML = `<strong>Generación GLC:</strong><br>"${grammarSample}"`;
}

function makeChoice(choice) {
  if (afd.transition(choice)) {
    updateUI();
  } else {
    alert('Transición no válida!');
  }
}

function resetGame() {
  afd.reset();
  updateUI();
}

// ============ FUNCIONES DE VISUALIZACIÓN ============
function showAFDInfo() {
  const modal = document.getElementById('afdModal');
  modal.style.display = 'block';

  // Verificar si vis.js está cargado
  if (typeof vis === 'undefined') {
    loadVisJS().then(drawAFDGraph);
  } else {
    drawAFDGraph();
  }
}

function loadVisJS() {
  return new Promise((resolve) => {
    if (typeof vis !== 'undefined') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/vis-network/standalone/umd/vis-network.min.js';
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

function drawAFDGraph() {
  try {
    const container = document.getElementById('afdGraph');
    const nodes = [];
    const edges = [];
    let finalStatesCount = 0;

    Object.keys(afd.states).forEach(state => {
      const stateObj = afd.states[state];
      const isCurrent = state === afd.currentState;
      const isFinal = stateObj.isFinal;

      if (isFinal) finalStatesCount++;

      nodes.push({
        id: state,
        label: state,
        color: isCurrent ? '#00d4ff' : (isFinal ? '#ff4757' : '#4a9eff'),
        shape: isFinal ? 'diamond' : 'ellipse',
        borderWidth: isCurrent ? 3 : 1,
        size: isCurrent ? 25 : 20,
        font: { size: isCurrent ? 16 : 14 }
      });

      Object.entries(stateObj.transitions).forEach(([input, target]) => {
        edges.push({
          from: state,
          to: target,
          label: input,
          arrows: 'to',
          font: { align: 'top' },
          color: '#cccccc',
          smooth: { type: 'curvedCW', roundness: 0.2 }
        });
      });
    });

    document.getElementById('totalStates').textContent = nodes.length;
    document.getElementById('totalTransitions').textContent = edges.length;
    document.getElementById('finalStates').textContent = finalStatesCount;

    const data = { nodes, edges };
    const options = {
      layout: {
        hierarchical: {
          direction: 'LR',
          sortMethod: 'directed'
        }
      },
      physics: {
        hierarchicalRepulsion: {
          nodeDistance: 120
        }
      },
      edges: {
        smooth: true
      }
    };

    new vis.Network(container, data, options);
  } catch (error) {
    console.error('Error al dibujar el AFD:', error);
    alert('Error al cargar el visualizador del AFD. Por favor recarga la página.');
  }
}

function closeModal() {
  document.getElementById('afdModal').style.display = 'none';
  document.getElementById('glcModal').style.display = 'none';
}

// ============ FUNCIONES DE GLC ============
function showGLCDetails() {
  const modal = document.getElementById('glcModal');
  modal.style.display = 'block';
  updateGrammarDisplay();
}

function updateGrammarDisplay() {
  const rulesContainer = document.getElementById('grammarRules');
  let rulesHTML = '';

  Object.entries(gramatica.rules).forEach(([nonTerminal, productions]) => {
    rulesHTML += `<div class="rule"><strong>${nonTerminal} →</strong> `;
    rulesHTML += productions.map(prod =>
      prod.map(symbol =>
        gramatica.rules[symbol] ? `<span class="non-terminal">${symbol}</span>` : `"${symbol}"`
      ).join(' ')
    ).join(' | ');
    rulesHTML += '</div>';
  });

  rulesContainer.innerHTML = rulesHTML;
  generateGrammarExample();
}

function generateGrammarExample() {
  const examplesContainer = document.getElementById('grammarExamples');
  const example = gramatica.generateText();
  const exampleWithState = gramatica.enhanceDescription("Texto generado por la GLC:", "ejemplo");

  examplesContainer.innerHTML = `
    <div class="example">
      <p><strong>Ejemplo básico:</strong><br>${example}</p>
      <p><strong>Ejemplo enriquecido:</strong><br>${exampleWithState}</p>
    </div>
  `;
}

// ============ FUNCIONES UTILITARIAS ============
function getTransitionEmoji(transition) {
  const emojis = {
    'explorar': '🔍',
    'huir': '🏃‍♂️',
    'izquierda': '⬅️',
    'derecha': '➡️',
    'retroceder': '🔙',
    'nadar': '🏊‍♂️',
    'buscar_bote': '🚣‍♂️',
    'puerta_dorada': '🚪✨',
    'puerta_plateada': '🚪🌟',
    'estudiar_jeroglificos': '📜',
    'resolver': '🧩',
    'adivinar': '🎲',
    'seguir_instrucciones': '📋'
  };
  return emojis[transition] || '⚡';
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar el juego
  updateUI();

  // Agregar botón para GLC
  const controlsSection = document.querySelector('.debug-section:last-child');
  if (controlsSection) {
    const glcButton = document.createElement('button');
    glcButton.className = 'reset-btn';
    glcButton.style.background = '#9c88ff';
    glcButton.textContent = '📖 Ver GLC Completa';
    glcButton.onclick = showGLCDetails;
    controlsSection.appendChild(glcButton);
  }
});