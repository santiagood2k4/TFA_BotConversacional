// static/js/script.js

// ============ FUNCIONES DE COMUNICACIÓN CON EL SERVIDOR ============

/**
 * Realiza una petición GET a una URL de Django.
 * @param {string} url La URL a la que se enviará la petición.
 * @returns {Promise<Object>} Una promesa que resuelve con los datos JSON de la respuesta.
 */
async function fetchData(url) {
    try {
        console.log("Solicitando datos a:", url);
        const response = await fetch(url);
        console.log("Respuesta recibida:", response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Datos recibidos:", data);
        return data;
    } catch (error) {
        console.error("Error al obtener datos del servidor:", error);
        showMessage("Error al cargar datos: " + error.message, "error");
        return null;
    }
}

/**
 * Realiza una petición POST a una URL de Django.
 * @param {string} url La URL a la que se enviará la petición.
 * @param {Object} data Los datos a enviar en el cuerpo de la petición.
 * @returns {Promise<Object>} Una promesa que resuelve con los datos JSON de la respuesta.
 */
async function postData(url, data) {
    try {
        // En un proyecto de Django en producción, deberías incluir el token CSRF aquí.
        // Por ahora, usamos @csrf_exempt en las vistas para simplificar el desarrollo.
        // Para producción:
        // const csrftoken = getCookie('csrftoken'); // Necesitas una función para obtener la cookie CSRF
        // headers: { 'X-CSRFToken': csrftoken, 'Content-Type': 'application/json' }
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text(); // Intenta leer el mensaje de error del servidor
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error al enviar datos al servidor:", error);
        alert(`Error en la acción: ${error.message || 'Desconocido'}.`);
        return null;
    }
}

// ============ FUNCIONES DE ACTUALIZACIÓN DE UI ============

/**
 * Actualiza la interfaz de usuario con el estado del juego recibido del servidor.
 * @param {Object} gameState Los datos del estado del juego.
 */
function updateUI(gameState) {
    if (!gameState) return;

    const storyTextDiv = document.getElementById('storyText');
    const currentStateDisplay = document.getElementById('currentState');
    const visitedStatesDisplay = document.getElementById('visitedStates');
    const possibleTransitionsDisplay = document.getElementById('possibleTransitions');

    const userInput = document.getElementById('userInput');
    const submitChoiceBtn = document.getElementById('submitChoice');
    const optionsContainer = document.getElementById('optionsContainer');

    // Verificar que todos los elementos existan
    if (!storyTextDiv) {
        console.error("No se encontró el elemento storyText");
        return;
    }
    if (!currentStateDisplay) {
        console.error("No se encontró el elemento currentState");
        return;
    }
    if (!visitedStatesDisplay) {
        console.error("No se encontró el elemento visitedStates");
        return;
    }
    if (!possibleTransitionsDisplay) {
        console.error("No se encontró el elemento possibleTransitions");
        return;
    }
    if (!userInput) {
        console.error("No se encontró el elemento userInput");
        return;
    }
    if (!submitChoiceBtn) {
        console.error("No se encontró el elemento submitChoice");
        return;
    }
    if (!optionsContainer) {
        console.error("No se encontró el elemento optionsContainer");
        return;
    }

    // Efecto de transición suave para el texto
    storyTextDiv.style.opacity = '0.7';
    storyTextDiv.innerHTML = `<strong>Estado: ${gameState.current_state.toUpperCase()}</strong><br><br>${gameState.story_text}`;
    setTimeout(() => {
        storyTextDiv.style.opacity = '1';
    }, 100);

    currentStateDisplay.textContent = gameState.current_state.toUpperCase();
    visitedStatesDisplay.innerHTML = gameState.visited_states.map(state =>
        `<span class="state-indicator">${state}</span>`
    ).join('');

    possibleTransitionsDisplay.textContent = gameState.possible_transitions.length > 0 ?
        gameState.possible_transitions.join(', ') : 'Estado final - Sin transiciones';



    // Generar botones de opciones dinámicamente o manejar el input de texto
    optionsContainer.innerHTML = ''; // Limpiar opciones anteriores
    if (gameState.possible_transitions && gameState.possible_transitions.length > 0) {
        // Si hay transiciones posibles, podemos mostrar un input de texto para el usuario.
        // Ya que el requisito es decisiones conversacionales, se usará un input de texto.
        // Si quisieras botones como antes, tendrías que crearlos aquí.
        // Por ahora, solo nos aseguramos de que el input y botón estén activos.
        userInput.disabled = false;
        submitChoiceBtn.disabled = false;
        userInput.value = ''; // Limpiar el input para la siguiente acción
        document.querySelector('.input-container').style.display = 'flex'; // Asegurar que sea visible

        // Aquí podrías añadir los botones si los necesitas.
        // Por ejemplo:
        // gameState.possible_transitions.forEach(transition => {
        //     const button = document.createElement('button');
        //     button.className = 'option-btn';
        //     button.textContent = `▶️ ${transition}`; // Puedes añadir un emoji o formato
        //     button.onclick = () => makeChoice(transition); // Llama a makeChoice con la transición
        //     optionsContainer.appendChild(button);
        // });
    }


    if (gameState.is_final_state) {
        userInput.disabled = true;
        submitChoiceBtn.disabled = true;
        const finalMessageDiv = document.createElement('div');
        finalMessageDiv.style.textAlign = 'center';
        finalMessageDiv.style.padding = '20px';
        finalMessageDiv.style.fontSize = '18px';
        finalMessageDiv.style.fontWeight = 'bold';
        finalMessageDiv.style.marginTop = '20px';

        const messages = {
            'victoria_tecnologica': '🔬 ¡VICTORIA TECNOLÓGICA! 🔬',
            'victoria_humana': '💪 ¡VICTORIA HUMANA! 💪',
            'victoria_legendaria': '🌟 ¡VICTORIA LEGENDARIA! 🌟',
            'derrota_cobarde': '😰 DERROTA POR COBARDÍA 😰',
            'derrota_destruccion': '💥 DERROTA POR DESTRUCCIÓN 💥',
            'derrota_ignorancia': '🙈 DERROTA POR IGNORANCIA 🙈',
            'derrota_desconfianza': '🤐 DERROTA POR DESCONFIANZA 🤐',
            'derrota_evacuacion': '🚪 DERROTA POR EVACUACIÓN 🚪',
            'victoria': '🏆 ¡VICTORIA ÉPICA! 🏆',
            'derrota': '💀 GAME OVER 💀',
            'final_neutral': '🤔 FINAL REFLEXIVO 🤔'
        };
        finalMessageDiv.innerHTML = messages[gameState.final_type] || '🏁 FIN DE LA AVENTURA 🏁';
        // Añadir el mensaje de fin de juego después del storyText o en un lugar visible
        storyTextDiv.appendChild(finalMessageDiv); // Esto podría requerir ajuste de CSS para verse bien.
        // Ocultar input y botón de envío si el juego ha terminado
        document.querySelector('.input-container').style.display = 'none';
        
        // Mostrar botón de reinicio
        const restartContainer = document.getElementById('restartContainer');
        if (restartContainer) {
            restartContainer.style.display = 'block';
        }

    } else {
        userInput.disabled = false;
        submitChoiceBtn.disabled = false;
        userInput.value = ''; // Limpiar el input para la siguiente acción
        document.querySelector('.input-container').style.display = 'flex'; // Asegurar que sea visible
        
        // Ocultar botón de reinicio
        const restartContainer = document.getElementById('restartContainer');
        if (restartContainer) {
            restartContainer.style.display = 'none';
        }
    }
}

// ============ FUNCIONES DE INTERACCIÓN DEL JUEGO ============

async function startGame() {
    const gameState = await fetchData('/game/state/?v=' + Date.now()); // Pide el estado inicial del juego a Django
    updateUI(gameState);
}

async function makeChoice() {
    const userInput = document.getElementById('userInput');
    const submitBtn = document.getElementById('submitChoice');
    
    if (!userInput.value.trim()) {
        showMessage('Por favor, introduce una acción.', 'warning');
        return;
    }

    // Deshabilitar botón durante el procesamiento
    submitBtn.disabled = true;
    submitBtn.textContent = 'Procesando...';

    const response = await postData('/game/process_choice/', { choice: userInput.value });

    // Rehabilitar botón
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar';

    if (response && response.success) {
        updateUI(response);
        showMessage('¡Acción procesada correctamente!', 'success');
    } else if (response && response.message) {
        showMessage(response.message, 'error');
    }
}

function showMessage(message, type = 'info') {
    // Crear elemento de mensaje
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;
    
    // Colores según tipo
    const colors = {
        'success': '#2ed573',
        'error': '#ff4757',
        'warning': '#ffa502',
        'info': '#4a9eff'
    };
    
    messageDiv.style.backgroundColor = colors[type] || colors.info;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

function showHelp() {
    const modal = document.getElementById('helpModal');
    if (modal) {
        modal.style.display = 'block';
        console.log("Modal de ayuda abierto");
    } else {
        console.error("No se encontró el modal de ayuda");
        showMessage("Error al abrir la ayuda", "error");
    }
}

function showActionSuggestions(userInput) {
    // Obtener las transiciones disponibles del estado actual
    const possibleTransitionsDisplay = document.getElementById('possibleTransitions');
    if (!possibleTransitionsDisplay) return;
    
    const availableActions = possibleTransitionsDisplay.textContent.split(', ');
    
    // Crear o actualizar el contenedor de sugerencias
    let suggestionsContainer = document.getElementById('actionSuggestions');
    if (!suggestionsContainer) {
        suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'actionSuggestions';
        suggestionsContainer.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(0,0,0,0.9);
            border: 1px solid #4a9eff;
            border-radius: 5px;
            max-height: 150px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
        `;
        
        const inputContainer = document.querySelector('.input-container');
        inputContainer.style.position = 'relative';
        inputContainer.appendChild(suggestionsContainer);
    }
    
    if (!userInput.trim()) {
        suggestionsContainer.style.display = 'none';
        return;
    }
    
    // Filtrar sugerencias basadas en la entrada del usuario
    const filteredSuggestions = availableActions.filter(action => 
        action.toLowerCase().includes(userInput.toLowerCase())
    );
    
    if (filteredSuggestions.length > 0) {
        suggestionsContainer.innerHTML = filteredSuggestions.map(action => 
            `<div class="suggestion-item" onclick="selectSuggestion('${action}')">${action}</div>`
        ).join('');
        suggestionsContainer.style.display = 'block';
    } else {
        suggestionsContainer.style.display = 'none';
    }
}

function selectSuggestion(action) {
    document.getElementById('userInput').value = action;
    document.getElementById('actionSuggestions').style.display = 'none';
}

async function resetGame() {
    const resetBtn = document.querySelector('.reset-btn');
    const originalText = resetBtn.textContent;
    
    // Confirmar reinicio
    if (!confirm('¿Estás seguro de que quieres reiniciar la aventura? Perderás todo el progreso.')) {
        return;
    }
    
    // Mostrar estado de carga
    resetBtn.disabled = true;
    resetBtn.textContent = '🔄 Reiniciando...';
    
    const response = await postData('/game/reset/', {});
    
    // Restaurar botón
    resetBtn.disabled = false;
    resetBtn.textContent = originalText;
    
    if (response && response.success) {
        await startGame(); // Vuelve a iniciar el juego para obtener el estado reiniciado
        showMessage('¡Aventura reiniciada! Comienza de nuevo.', 'success');
    } else if (response && response.message) {
        showMessage(response.message, 'error');
    }
}

// ============ FUNCIONES DE VISUALIZACIÓN DE MODALES ============

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function showAFDInfo() {
    console.log("Función showAFDInfo llamada");
    const modal = document.getElementById('afdModal');
    if (!modal) {
        console.error("No se encontró el modal del AFD");
        showMessage("Error: No se encontró el modal del AFD", "error");
        return;
    }
    console.log("Modal encontrado, mostrando...");
    modal.style.display = 'block';

    try {
        console.log("Solicitando información del AFD...");
        const afdInfo = await fetchData('/game/afd_info/?v=' + Date.now());
        console.log("Información del AFD recibida:", afdInfo);
        
        if (!afdInfo) {
            console.error("No se pudo obtener información del AFD");
            showMessage("Error al cargar datos. Por favor, recarga la página.", "error");
            return;
        }
        
        if (!afdInfo.states || !Array.isArray(afdInfo.states)) {
            console.error("Información del AFD inválida:", afdInfo);
            showMessage("Datos del AFD inválidos. Por favor, recarga la página.", "error");
            return;
        }
        
        // Asegúrate de cargar vis.js si no está ya
        if (typeof vis === 'undefined') {
            console.log("Cargando Vis.js dinámicamente...");
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/vis-network/standalone/umd/vis-network.min.js';
            script.onload = () => {
                console.log("Vis.js cargado, dibujando gráfico...");
                drawAFDGraph(afdInfo);
            };
            script.onerror = () => {
                console.error("Error al cargar Vis.js");
                showMessage("Error al cargar la librería de visualización", "error");
            };
            document.head.appendChild(script);
        } else {
            console.log("Vis.js ya está cargado, dibujando gráfico...");
            drawAFDGraph(afdInfo);
        }
    } catch (error) {
        console.error("Error al obtener información del AFD:", error);
        showMessage("Error al cargar el diagrama del AFD: " + error.message, "error");
    }
}

function drawAFDGraph(afdInfo) {
    console.log("Iniciando dibujo del gráfico AFD con datos:", afdInfo);
    console.log("Tipo de vis:", typeof vis);
    console.log("Vis disponible:", window.vis);
    
    if (typeof vis === 'undefined') {
        console.warn("Vis.js no está cargado. Asegúrate de que el script está en game.html.");
        showMessage("Error: Vis.js no está cargado. Recarga la página.", "error");
        return;
    }

    const container = document.getElementById('afdGraph');
    console.log("Buscando contenedor afdGraph:", container);
    if (!container) {
        console.error("No se encontró el contenedor del gráfico AFD");
        console.log("Elementos con id que contienen 'afd':", document.querySelectorAll('[id*="afd"]'));
        showMessage("Error: No se encontró el contenedor del gráfico", "error");
        return;
    }
    console.log("Contenedor encontrado:", container);

    const nodes = [];
    const edges = [];

    afdInfo.states.forEach(state => {
        // Determinar el color del nodo
        let nodeColor = '#4a9eff'; // Color por defecto
        if (state.id === afdInfo.current_state) {
            nodeColor = '#00d4ff'; // Estado actual
        } else if (state.isFinal) {
            nodeColor = '#ff4757'; // Estado final
        }

        // Crear etiqueta más legible
        let label = state.label;
        if (label.includes('_')) {
            label = label.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join('\n');
        }

        nodes.push({
            id: state.id,
            label: label,
            color: nodeColor,
            shape: state.isFinal ? 'diamond' : 'ellipse',
            borderWidth: (state.id === afdInfo.current_state) ? 3 : 1,
            size: (state.id === afdInfo.current_state) ? 35 : 30,
            font: { 
                size: (state.id === afdInfo.current_state) ? 16 : 14,
                color: '#ffffff',
                face: 'Arial'
            },
            title: state.description || state.label // Tooltip con descripción
        });

        Object.entries(state.transitions).forEach(([input, target]) => {
            // Crear etiqueta más legible para las transiciones
            let transitionLabel = input;
            if (input.includes('_')) {
                transitionLabel = input.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
            }

            edges.push({
                from: state.id,
                to: target,
                label: transitionLabel,
                arrows: 'to',
                font: { 
                    align: 'middle',
                    size: 11,
                    color: '#ffffff',
                    face: 'Arial'
                },
                color: '#cccccc',
                smooth: { type: 'curvedCW', roundness: 0.2 },
                width: 2
            });
        });
    });

    // Actualizar estadísticas
    document.getElementById('totalStates').textContent = afdInfo.total_states;
    document.getElementById('totalTransitions').textContent = afdInfo.total_transitions;
    document.getElementById('finalStates').textContent = afdInfo.final_states_count;

    const data = { nodes, edges };
    const options = {
        layout: {
            hierarchical: {
                direction: 'LR',
                sortMethod: 'directed',
                levelSeparation: 180,
                nodeSpacing: 120
            }
        },
        physics: {
            enabled: false // Desactivar física para mejor control del layout
        },
        edges: {
            smooth: {
                type: 'curvedCW',
                roundness: 0.3
            }
        },
        nodes: {
            shadow: {
                enabled: true,
                color: 'rgba(0,0,0,0.3)',
                size: 10,
                x: 5,
                y: 5
            }
        },
        interaction: {
            hover: true,
            tooltipDelay: 200,
            zoomView: true,
            dragView: true
        }
    };

    console.log("Creando red de Vis.js con datos:", data);
    console.log("Opciones:", options);
    try {
        const network = new vis.Network(container, data, options);
        console.log("Red creada exitosamente:", network);
        showMessage("Diagrama AFD cargado correctamente", "success");
    } catch (error) {
        console.error("Error al crear el gráfico AFD:", error);
        showMessage("Error al crear el diagrama AFD: " + error.message, "error");
    }
}



// ============ INICIALIZACIÓN Y EVENT LISTENERS ============

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM cargado, inicializando juego...");
    
    // Inicializar el juego cargando el estado desde Django
    startGame();

    // Asignar el evento al botón de enviar (submitChoice)
    const submitChoiceBtn = document.getElementById('submitChoice');
    if (submitChoiceBtn) {
        submitChoiceBtn.addEventListener('click', makeChoice);
        console.log("Botón de enviar configurado");
    } else {
        console.error("No se encontró el botón de enviar");
    }

    // Permitir enviar con Enter en el campo de texto
    const userInputField = document.getElementById('userInput');
    if (userInputField) {
        userInputField.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Evitar el envío por defecto del formulario (si existiera)
                makeChoice();
            }
        });

        // Mostrar sugerencias mientras el usuario escribe
        userInputField.addEventListener('input', function() {
            showActionSuggestions(this.value);
        });
        console.log("Campo de texto configurado");
    } else {
        console.error("No se encontró el campo de texto");
    }

    // Asignar eventos a los botones de control (si están presentes)
    const resetBtn = document.querySelector('.reset-btn[onclick="resetGame()"]');
    if (resetBtn) {
        resetBtn.onclick = resetGame; // Re-asignar para asegurar que usa la función global
        console.log("Botón de reinicio configurado");
    } else {
        console.error("No se encontró el botón de reinicio");
    }

    const showAfdBtn = document.querySelector('.reset-btn[onclick="showAFDInfo()"]');
    if (showAfdBtn) {
        showAfdBtn.onclick = showAFDInfo;
        console.log("Botón de AFD configurado");
    } else {
        console.error("No se encontró el botón de AFD");
    }

    const showHelpBtn = document.querySelector('.reset-btn[onclick="showHelp()"]');
    if (showHelpBtn) {
        showHelpBtn.onclick = showHelp;
        console.log("Botón de ayuda configurado");
    } else {
        console.error("No se encontró el botón de ayuda");
    }

    // También actualiza los close buttons de los modales con la función corregida
    const closeButtons = document.querySelectorAll('.modal .close');
    closeButtons.forEach(button => {
        button.onclick = function() {
            closeModal(this.closest('.modal').id);
        };
    });
    console.log("Botones de cerrar modales configurados");

    // Cerrar modales al hacer clic fuera de ellos
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(event) {
            if (event.target === this) {
                closeModal(this.id);
            }
        });
    });
    console.log("Modales configurados para cerrar al hacer clic fuera");

    console.log("Inicialización completada");
});