# game/views.py

import json
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import login
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from .forms import CustomUserCreationForm


# ============ CLASES DEL JUEGO (ADAPTADAS DE script.js) ============
# NOTA: Estas clases se instancian una vez a nivel de módulo.
# Para un juego real con múltiples usuarios, necesitarías gestionar el estado
# de cada usuario usando sesiones de Django o una base de datos.
# Por ahora, esto es una simplificación para empezar.

class AFDNarrativo:
    def __init__(self):
        self.states = {
            'inicio': {
                'description': 'Te despiertas en una nave espacial abandonada. Las luces parpadean y el aire es denso. Los monitores muestran que estás en el sector Omega-7, una zona prohibida del espacio. Algo no está bien...',
                'transitions': {
                    'investigar_nave': 'sala_control',
                    'buscar_salida': 'final_escape_prematuro'
                }
            },
            'sala_control': {
                'description': 'Encuentras la sala de control. Los monitores muestran que la nave está en cuarentena por una infección alienígena. Hay tres sectores accesibles: el laboratorio, la bodega de carga y el sector médico.',
                'transitions': {
                    'laboratorio': 'sector_laboratorio',
                    'bodega': 'bodega_carga',
                    'medico': 'sector_medico',
                    'revisar_datos': 'analisis_datos'
                }
            },
            'sector_laboratorio': {
                'description': 'El laboratorio está en caos. Tubos de ensayo rotos, muestras extrañas y un diario científico que menciona "El Parásito". En una mesa hay una muestra de tejido alienígena pulsante.',
                'transitions': {
                    'examinar_muestra': 'muestra_alienigena',
                    'leer_diario': 'informacion_parasito',
                    'buscar_antidoto': 'antidoto_experimental',
                    'retroceder': 'sala_control'
                }
            },
            'bodega_carga': {
                'description': 'La bodega está llena de contenedores sellados. Uno de ellos tiene marcas de arañazos por dentro. En una esquina hay un traje espacial intacto y un arma láser.',
                'transitions': {
                    'investigar_contenedor': 'contenedor_sospechoso',
                    'tomar_traje': 'equipamiento_proteccion',
                    'tomar_arma': 'arma_laser',
                    'retroceder': 'sala_control'
                }
            },
            'sector_medico': {
                'description': 'El sector médico está desierto excepto por un paciente en cuarentena. Los signos vitales son estables pero extraños. En la pared hay un mapa del sistema de ventilación.',
                'transitions': {
                    'examinar_paciente': 'paciente_infectado',
                    'revisar_ventilacion': 'sistema_ventilacion',
                    'buscar_medicamentos': 'medicamentos_especiales',
                    'retroceder': 'sala_control'
                }
            },
            'muestra_alienigena': {
                'description': 'La muestra reacciona a tu presencia. Se mueve y emite un sonido agudo. Parece estar viva y estudiándote. ¿Es inteligente?',
                'transitions': {
                    'comunicarse': 'comunicacion_alienigena',
                    'destruir_muestra': 'destruccion_muestra',
                    'aislar_muestra': 'cuarentena_muestra',
                    'retroceder': 'sector_laboratorio'
                }
            },
            'contenedor_sospechoso': {
                'description': 'El contenedor se abre revelando un ser alienígena dormido. Es humanoide pero con características insectoides. Respira lentamente.',
                'transitions': {
                    'despertar_alien': 'alien_despierto',
                    'mantener_dormido': 'alien_dormido',
                    'analizar_alien': 'analisis_alienigeno',
                    'retroceder': 'bodega_carga'
                }
            },
            'paciente_infectado': {
                'description': 'El paciente tiene marcas extrañas en la piel y sus ojos son completamente negros. Habla en un idioma desconocido pero parece reconocerte.',
                'transitions': {
                    'intentar_comunicacion': 'comunicacion_paciente',
                    'aplicar_tratamiento': 'tratamiento_experimental',
                    'aislar_paciente': 'aislamiento_paciente',
                    'retroceder': 'sector_medico'
                }
            },
            'comunicacion_alienigena': {
                'description': 'La muestra responde a tus intentos de comunicación. Proyecta imágenes en tu mente: la nave, otros seres, y una advertencia sobre algo llamado "El Devorador".',
                'transitions': {
                    'entender_mensaje': 'comprension_alienigena',
                    'rechazar_vision': 'rechazo_vision',
                    'retroceder': 'muestra_alienigena'
                }
            },
            'alien_despierto': {
                'description': 'El alienígena se despierta y te mira con curiosidad, no con hostilidad. Extiende su mano en un gesto de paz. Parece querer ayudarte.',
                'transitions': {
                    'aceptar_ayuda': 'alianza_alienigena',
                    'desconfiar': 'desconfianza_alien',
                    'interrogar': 'interrogatorio_alien',
                    'retroceder': 'contenedor_sospechoso'
                }
            },
            'comunicacion_paciente': {
                'description': 'El paciente logra comunicarse contigo. Te explica que "El Devorador" está en el núcleo de la nave, alimentándose de la energía vital de todos los seres a bordo.',
                'transitions': {
                    'planear_ataque': 'plan_ataque_nucleo',
                    'buscar_debilidad': 'investigacion_devorador',
                    'evacuar_nave': 'evacuacion_emergencia',
                    'retroceder': 'paciente_infectado'
                }
            },
            'comprension_alienigena': {
                'description': 'Entiendes el mensaje. "El Devorador" es una entidad parásita que consume la conciencia de sus víctimas. Los alienígenas son refugiados que buscan tu ayuda.',
                'transitions': {
                    'formar_alianza': 'coalicion_aliados',
                    'preparar_ataque': 'preparacion_final',
                    'retroceder': 'comunicacion_alienigena'
                }
            },
            'alianza_alienigena': {
                'description': 'El alienígena te muestra cómo acceder al núcleo de la nave. Juntos forman un plan para enfrentar a "El Devorador" usando tecnología alienígena y humana.',
                'transitions': {
                    'ejecutar_plan': 'ataque_final',
                    'mejorar_plan': 'plan_mejorado',
                    'retroceder': 'alien_despierto'
                }
            },
            'plan_ataque_nucleo': {
                'description': 'Con la información del paciente y la ayuda alienígena, desarrollas un plan para infiltrar el núcleo y destruir a "El Devorador" desde dentro.',
                'transitions': {
                    'ejecutar_plan': 'ataque_final',
                    'buscar_mas_aliados': 'reclutamiento_aliados',
                    'retroceder': 'comunicacion_paciente'
                }
            },
            'ataque_final': {
                'description': 'Te infiltran en el núcleo de la nave. "El Devorador" es una masa amorfa de energía negra que pulsa con vida propia. Es hora de enfrentarlo.',
                'transitions': {
                    'usar_tecnologia_alien': 'victoria_tecnologia',
                    'usar_energia_humana': 'victoria_humana',
                    'combinar_fuerzas': 'victoria_coalicion'
                }
            },
            'victoria_tecnologia': {
                'description': 'Usas la tecnología alienígena para crear un campo de fuerza que neutraliza a "El Devorador". La nave se estabiliza y todos los infectados se recuperan.',
                'transitions': {},
                'isFinal': True,
                'finalType': 'victoria_tecnologica'
            },
            'victoria_humana': {
                'description': 'Tu determinación humana y el poder de tu voluntad logran expulsar a "El Devorador" de la nave. La entidad huye al espacio profundo.',
                'transitions': {},
                'isFinal': True,
                'finalType': 'victoria_humana'
            },
            'victoria_coalicion': {
                'description': 'La unión de tecnología alienígena y espíritu humano crea una fuerza imparable. "El Devorador" es destruido completamente. La nave se convierte en un símbolo de cooperación interestelar.',
                'transitions': {},
                'isFinal': True,
                'finalType': 'victoria_legendaria'
            },
            'final_escape_prematuro': {
                'description': 'Huyes de la nave sin entender la verdadera amenaza. "El Devorador" continúa su expansión, condenando a otros sistemas estelares.',
                'transitions': {},
                'isFinal': True,
                'finalType': 'derrota_cobarde'
            },
            'analisis_datos': {
                'description': 'Los datos revelan que la nave transportaba refugiados alienígenas cuando fue infectada por "El Devorador". Los alienígenas no son la amenaza, son las víctimas.',
                'transitions': {
                    'compartir_informacion': 'sala_control',
                    'investigar_mas': 'investigacion_profunda',
                    'retroceder': 'sala_control'
                }
            },
            'informacion_parasito': {
                'description': 'El diario describe a "El Devorador" como una entidad de energía pura que consume la conciencia de sus víctimas. Los científicos intentaron contenerlo pero fallaron.',
                'transitions': {
                    'aplicar_conocimiento': 'estrategia_cientifica',
                    'buscar_vacuna': 'desarrollo_vacuna',
                    'retroceder': 'sector_laboratorio'
                }
            },
            'antidoto_experimental': {
                'description': 'Encuentras un vial con un líquido azul brillante. Las etiquetas indican que es un antídoto experimental contra la infección del Devorador.',
                'transitions': {
                    'probar_antidoto': 'prueba_antidoto',
                    'analizar_composicion': 'analisis_antidoto',
                    'retroceder': 'sector_laboratorio'
                }
            },
            'equipamiento_proteccion': {
                'description': 'El traje espacial te proporciona protección contra la infección. También incluye un sistema de comunicación avanzado.',
                'transitions': {
                    'usar_traje': 'proteccion_activada',
                    'retroceder': 'bodega_carga'
                }
            },
            'arma_laser': {
                'description': 'El arma láser está cargada y lista para usar. Puede ser efectiva contra formas de energía como "El Devorador".',
                'transitions': {
                    'probar_arma': 'prueba_arma',
                    'retroceder': 'bodega_carga'
                }
            },
            'sistema_ventilacion': {
                'description': 'El mapa muestra que el sistema de ventilación conecta todos los sectores. Podrías usarlo para distribuir un antídoto o para acceder al núcleo.',
                'transitions': {
                    'usar_ventilacion': 'acceso_ventilacion',
                    'retroceder': 'sector_medico'
                }
            },
            'medicamentos_especiales': {
                'description': 'Encuentras medicamentos diseñados específicamente para tratar infecciones alienígenas. Podrían ser cruciales para salvar a los infectados.',
                'transitions': {
                    'aplicar_medicamentos': 'tratamiento_medicamentos',
                    'retroceder': 'sector_medico'
                }
            },
            'destruccion_muestra': {
                'description': 'Destruyes la muestra alienígena. Sin embargo, esto no detiene la amenaza principal. "El Devorador" sigue siendo una amenaza.',
                'transitions': {},
                'isFinal': True,
                'finalType': 'derrota_destruccion'
            },
            'cuarentena_muestra': {
                'description': 'Aíslas la muestra en una cámara de cuarentena. Esto te da tiempo para estudiarla sin riesgo de infección.',
                'transitions': {
                    'estudiar_seguro': 'estudio_seguro',
                    'retroceder': 'muestra_alienigena'
                }
            },
            'alien_dormido': {
                'description': 'Mantienes al alienígena dormido. Es más seguro pero no obtienes su ayuda potencial.',
                'transitions': {
                    'despertar_ahora': 'alien_despierto',
                    'retroceder': 'contenedor_sospechoso'
                }
            },
            'analisis_alienigeno': {
                'description': 'Tu análisis revela que el alienígena no está infectado. Es inmune a "El Devorador" y podría ser un aliado valioso.',
                'transitions': {
                    'despertar_aliado': 'alien_despierto',
                    'retroceder': 'contenedor_sospechoso'
                }
            },
            'tratamiento_experimental': {
                'description': 'Aplicas el tratamiento experimental al paciente. Sus signos vitales mejoran gradualmente y recupera la conciencia.',
                'transitions': {
                    'comunicarse_mejorado': 'comunicacion_paciente',
                    'retroceder': 'paciente_infectado'
                }
            },
            'aislamiento_paciente': {
                'description': 'Aíslas al paciente para prevenir la propagación de la infección. Es una medida de seguridad necesaria.',
                'transitions': {
                    'monitorear_paciente': 'monitoreo_paciente',
                    'retroceder': 'paciente_infectado'
                }
            },
            'rechazo_vision': {
                'description': 'Rechazas las visiones alienígenas. Sin embargo, la información podría haber sido valiosa para entender la amenaza.',
                'transitions': {},
                'isFinal': True,
                'finalType': 'derrota_ignorancia'
            },
            'desconfianza_alien': {
                'description': 'Tu desconfianza hacia el alienígena te hace perder un aliado potencial. La misión se vuelve más difícil.',
                'transitions': {},
                'isFinal': True,
                'finalType': 'derrota_desconfianza'
            },
            'interrogatorio_alien': {
                'description': 'Interrogas al alienígena. Te proporciona información valiosa sobre "El Devorador" y cómo combatirlo.',
                'transitions': {
                    'aceptar_informacion': 'alianza_alienigena',
                    'retroceder': 'alien_despierto'
                }
            },
            'investigacion_devorador': {
                'description': 'Investigas las debilidades de "El Devorador". Descubres que es vulnerable a ciertas frecuencias de energía.',
                'transitions': {
                    'desarrollar_arma': 'desarrollo_arma_especial',
                    'retroceder': 'comunicacion_paciente'
                }
            },
            'evacuacion_emergencia': {
                'description': 'Intentas evacuar la nave. Sin embargo, "El Devorador" bloquea todas las salidas. La evacuación no es una opción.',
                'transitions': {},
                'isFinal': True,
                'finalType': 'derrota_evacuacion'
            },
            'coalicion_aliados': {
                'description': 'Formas una coalición entre humanos y alienígenas. Juntos tienen la mejor oportunidad de derrotar a "El Devorador".',
                'transitions': {
                    'ejecutar_plan_conjunto': 'ataque_final',
                    'retroceder': 'comprension_alienigena'
                }
            },
            'preparacion_final': {
                'description': 'Te preparas para el ataque final contra "El Devorador". Reúnes todos los recursos disponibles.',
                'transitions': {
                    'lanzar_ataque': 'ataque_final',
                    'retroceder': 'comprension_alienigena'
                }
            },
            'plan_mejorado': {
                'description': 'Mejoras el plan con tecnología alienígena avanzada. La probabilidad de éxito aumenta significativamente.',
                'transitions': {
                    'ejecutar_plan_mejorado': 'ataque_final',
                    'retroceder': 'alianza_alienigena'
                }
            },
            'reclutamiento_aliados': {
                'description': 'Reclutas más aliados de entre los alienígenas y humanos sanos. Tu ejército crece.',
                'transitions': {
                    'ataque_masivo': 'ataque_final',
                    'retroceder': 'plan_ataque_nucleo'
                }
            }
        }
        self.currentState = 'inicio'
        self.visitedStates = ['inicio']
        # El alfabeto se deduce de las transiciones en tiempo de ejecución o se define si es un AFD fijo.

    def get_current_state(self):
        # Verificar si el estado actual existe, si no, resetear al inicio
        if self.currentState not in self.states:
            self.reset()
        return self.states[self.currentState]

    def get_available_transitions(self):
        return list(self.get_current_state()['transitions'].keys())

    def transition(self, input_choice):
        current_state_obj = self.get_current_state()
        if input_choice in current_state_obj['transitions']:
            self.currentState = current_state_obj['transitions'][input_choice]
            if self.currentState not in self.visitedStates:
                self.visitedStates.append(self.currentState)
            return True
        return False

    def reset(self):
        self.currentState = 'inicio'
        self.visitedStates = ['inicio']

    def is_accepting_state(self):
        return self.get_current_state().get('isFinal', False)

    def get_all_states(self):
        return list(self.states.keys())

    def get_transitions_from_state(self, state):
        return self.states.get(state, {}).get('transitions', {})

class GramaticaNarrativa:
    def __init__(self):
        self.rules = {
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
                ['en una nave espacial abandonada'],
                ['ante controles alienígenas misteriosos'],
                ['frente a un laboratorio de alta tecnología'],
                ['en una cámara de cuarentena espacial'],
                ['dentro de un túnel de ventilación espacial']
            ],
            'DETALLE_AMBIENTAL': [
                ['con luces parpadeantes a lo lejos'],
                ['mientras los sistemas de vida susurran datos'],
                ['con paneles de control brillando en las paredes'],
                ['bajo la luz azul de las pantallas holográficas'],
                ['respirando aire filtrado y estéril']
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
                ['en el corazón de la nave espacial'],
                ['en los confines del cosmos'],
                ['en el epicentro de la misión'],
                ['en el umbral del descubrimiento alienígena']
            ],
            'SENSACION': [
                ['sientes la presencia alienígena'],
                ['percibes la tecnología avanzada'],
                ['experimentas una conexión interestelar'],
                ['vives la emoción de la exploración espacial']
            ]
        }
        self.contextualEnhancements = {
            'inicio': ['Una misión espacial te espera en las profundidades del cosmos...'],
            'sala_control': ['Los monitores parpadean con información vital sobre la nave...'],
            'sector_laboratorio': ['El aire está cargado con el aroma de experimentos científicos...'],
            'bodega_carga': ['El eco de tus pasos resuena en la bodega espacial...'],
            'sector_medico': ['La tecnología médica avanzada rodea cada rincón...'],
            'muestra_alienigena': ['La muestra alienígena pulsa con vida propia...'],
            'contenedor_sospechoso': ['El contenedor emite un resplandor misterioso...'],
            'paciente_infectado': ['Los signos vitales del paciente muestran patrones extraños...'],
            'comunicacion_alienigena': ['Las ondas telepáticas alienígenas inundan tu mente...'],
            'alien_despierto': ['El alienígena te mira con ojos que contienen milenios de sabiduría...'],
            'comunicacion_paciente': ['El paciente proyecta imágenes de la amenaza que acecha...'],
            'comprension_alienigena': ['Tu mente se expande con el conocimiento alienígena...'],
            'alianza_alienigena': ['Una alianza interestelar se forma ante tus ojos...'],
            'plan_ataque_nucleo': ['El plan de batalla se desarrolla en tu mente...'],
            'ataque_final': ['El momento de la verdad ha llegado. El destino de la nave está en tus manos...'],
            'victoria_tecnologica': ['La tecnología alienígena ha salvado el día...'],
            'victoria_humana': ['El espíritu humano ha triunfado sobre la adversidad...'],
            'victoria_legendaria': ['Una leyenda interestelar ha nacido...']
        }

    def generate_text(self, start_symbol='S'):
        if start_symbol not in self.rules:
            return start_symbol

        productions = self.rules[start_symbol]
        import random
        random_production = random.choice(productions)

        generated_parts = []
        for symbol in random_production:
            if symbol in self.rules:
                generated_parts.append(self.generate_text(symbol))
            else:
                generated_parts.append(symbol)
        return ' '.join(generated_parts)

    def enhance_description(self, base_description, current_state):
        enhancement = self.contextualEnhancements.get(current_state)
        generated_text = self.generate_text()

        result = base_description

        if enhancement:
            result += f"\n\n{enhancement[0]}"

        result += f"\n\n💭 {generated_text}"

        return result

    def validate_input(self, user_input, available_transitions):
        """
        Valida la entrada del usuario usando reglas de GLC para reconocer acciones válidas.
        """
        # Normalizar la entrada del usuario
        normalized_input = user_input.strip().lower()
        
        # 1. Validación directa - verificar si coincide exactamente con una transición
        if normalized_input in available_transitions:
            return True, normalized_input
        
        # 2. Validación por sinónimos y variaciones usando GLC
        # Definir reglas de equivalencia para cada acción
        action_equivalents = {
            # Acciones básicas
            'investigar_nave': ['investigar nave', 'explorar nave', 'examinar nave', 'revisar nave'],
            'buscar_salida': ['buscar salida', 'encontrar salida', 'escapar', 'huir'],
            
            # Navegación
            'laboratorio': ['laboratorio', 'sector laboratorio', 'ir laboratorio', 'al laboratorio'],
            'bodega': ['bodega', 'bodega de carga', 'sector bodega', 'ir bodega'],
            'medico': ['médico', 'sector médico', 'medico', 'ir médico', 'al médico'],
            'retroceder': ['retroceder', 'volver', 'regresar', 'atrás', 'retroceso'],
            
            # Acciones del laboratorio
            'examinar_muestra': ['examinar muestra', 'investigar muestra', 'analizar muestra', 'estudiar muestra'],
            'leer_diario': ['leer diario', 'revisar diario', 'examinar diario', 'estudiar diario'],
            'buscar_antidoto': ['buscar antídoto', 'encontrar antídoto', 'antídoto', 'medicamento'],
            
            # Acciones de la bodega
            'investigar_contenedor': ['investigar contenedor', 'examinar contenedor', 'revisar contenedor'],
            'tomar_traje': ['tomar traje', 'equipar traje', 'poner traje', 'traje espacial'],
            'tomar_arma': ['tomar arma', 'equipar arma', 'arma láser', 'arma laser'],
            
            # Acciones del sector médico
            'examinar_paciente': ['examinar paciente', 'revisar paciente', 'investigar paciente'],
            'revisar_ventilacion': ['revisar ventilación', 'examinar ventilación', 'sistema ventilación'],
            'buscar_medicamentos': ['buscar medicamentos', 'encontrar medicamentos', 'medicamentos'],
            
            # Comunicación
            'comunicarse': ['comunicarse', 'hablar', 'intentar comunicación', 'contactar'],
            'intentar_comunicacion': ['intentar comunicación', 'comunicarse', 'hablar', 'contactar'],
            
            # Acciones con alienígenas
            'despertar_alien': ['despertar alien', 'despertar alienígena', 'activar alien'],
            'mantener_dormido': ['mantener dormido', 'dejar dormido', 'no despertar'],
            'analizar_alien': ['analizar alien', 'estudiar alien', 'examinar alien'],
            
            # Acciones con pacientes
            'aplicar_tratamiento': ['aplicar tratamiento', 'tratar paciente', 'medicamento'],
            'aislar_paciente': ['aislar paciente', 'cuarentena', 'aislamiento'],
            
            # Comprensión y alianzas
            'entender_mensaje': ['entender mensaje', 'comprender', 'interpretar'],
            'rechazar_vision': ['rechazar visión', 'ignorar', 'rechazar'],
            'aceptar_ayuda': ['aceptar ayuda', 'confiar', 'aliarse'],
            'desconfiar': ['desconfiar', 'no confiar', 'rechazar ayuda'],
            'interrogar': ['interrogar', 'preguntar', 'cuestionar'],
            
            # Planificación
            'planear_ataque': ['planear ataque', 'plan ataque', 'estrategia'],
            'buscar_debilidad': ['buscar debilidad', 'investigar debilidad', 'vulnerabilidad'],
            'evacuar_nave': ['evacuar nave', 'evacuar', 'escapar nave'],
            
            # Formación de alianzas
            'formar_alianza': ['formar alianza', 'aliarse', 'coalición'],
            'preparar_ataque': ['preparar ataque', 'prepararse', 'organizar'],
            
            # Ejecución de planes
            'ejecutar_plan': ['ejecutar plan', 'lanzar ataque', 'atacar'],
            'mejorar_plan': ['mejorar plan', 'optimizar', 'perfeccionar'],
            
            # Ataque final
            'usar_tecnologia_alien': ['usar tecnología alien', 'tecnología alienígena', 'arma alien'],
            'usar_energia_humana': ['usar energía humana', 'fuerza humana', 'voluntad'],
            'combinar_fuerzas': ['combinar fuerzas', 'unir fuerzas', 'cooperación'],
            
            # Acciones adicionales
            'revisar_datos': ['revisar datos', 'analizar datos', 'examinar datos'],
            'compartir_informacion': ['compartir información', 'informar', 'comunicar'],
            'investigar_mas': ['investigar más', 'profundizar', 'más investigación'],
            'aplicar_conocimiento': ['aplicar conocimiento', 'usar información', 'implementar'],
            'buscar_vacuna': ['buscar vacuna', 'desarrollar vacuna', 'vacuna'],
            'probar_antidoto': ['probar antídoto', 'testear antídoto', 'experimentar'],
            'analizar_composicion': ['analizar composición', 'estudiar composición', 'examinar'],
            'usar_traje': ['usar traje', 'equipar traje', 'activar protección'],
            'probar_arma': ['probar arma', 'testear arma', 'disparar'],
            'usar_ventilacion': ['usar ventilación', 'acceder ventilación', 'sistema'],
            'aplicar_medicamentos': ['aplicar medicamentos', 'medicar', 'tratar'],
            'estudiar_seguro': ['estudiar seguro', 'analizar seguro', 'investigar seguro'],
            'despertar_ahora': ['despertar ahora', 'activar ahora', 'despertar'],
            'despertar_aliado': ['despertar aliado', 'activar aliado', 'despertar'],
            'comunicarse_mejorado': ['comunicarse mejorado', 'hablar mejorado', 'contactar'],
            'monitorear_paciente': ['monitorear paciente', 'vigilar paciente', 'observar'],
            'aceptar_informacion': ['aceptar información', 'recibir información', 'confiar'],
            'desarrollar_arma': ['desarrollar arma', 'crear arma', 'construir arma'],
            'ejecutar_plan_conjunto': ['ejecutar plan conjunto', 'ataque conjunto', 'cooperación'],
            'lanzar_ataque': ['lanzar ataque', 'iniciar ataque', 'comenzar ataque'],
            'ejecutar_plan_mejorado': ['ejecutar plan mejorado', 'plan optimizado', 'ataque mejorado'],
            'ataque_masivo': ['ataque masivo', 'ofensiva masiva', 'ataque conjunto']
        }
        
        # 3. Buscar coincidencias usando las reglas de equivalencia (validación estricta)
        for transition in available_transitions:
            if transition in action_equivalents:
                equivalents = action_equivalents[transition]
                for equivalent in equivalents:
                    # Validación estricta: la entrada debe coincidir exactamente o ser una palabra completa
                    if (normalized_input == equivalent or 
                        normalized_input.startswith(equivalent + ' ') or 
                        normalized_input.endswith(' ' + equivalent) or
                        ' ' + equivalent + ' ' in ' ' + normalized_input + ' '):
                        return True, transition
        
        # 4. Validación por palabras clave (fallback mejorado)
        for transition in available_transitions:
            # Dividir la transición en palabras clave
            keywords = transition.replace('_', ' ').split()
            # Verificar que TODAS las palabras clave estén en la entrada del usuario
            # y que no haya caracteres extraños al inicio o final
            input_words = normalized_input.split()
            if len(input_words) >= len(keywords):
                # Verificar que las palabras clave estén en orden en la entrada
                keyword_index = 0
                for word in input_words:
                    if keyword_index < len(keywords) and keywords[keyword_index] in word:
                        keyword_index += 1
                        if keyword_index == len(keywords):
                            return True, transition
        
        return False, None

# Instancias globales para el juego (se resetean con cada reinicio de servidor)
afd_instance = AFDNarrativo()
gramatica_instance = GramaticaNarrativa()


# ============ VISTAS DE DJANGO ============

@login_required
def game_view(request):
    """
    Vista que renderiza la plantilla principal del juego.
    También inicializa o recupera el estado del juego de la sesión.
    """
    # Inicializar o recuperar el estado del juego de la sesión
    # Las sesiones de Django nos permiten mantener el estado del usuario entre peticiones
    if 'game_state' not in request.session:
        # Si no hay estado en la sesión, inicializar el juego
        afd_instance.reset() # Asegura que el AFD esté en el estado inicial
        request.session['game_state'] = {
            'current_state': afd_instance.currentState,
            'visited_states': afd_instance.visitedStates,
        }
    else:
        # Cargar el estado del AFD desde la sesión
        afd_instance.currentState = request.session['game_state']['current_state']
        afd_instance.visitedStates = request.session['game_state']['visited_states']
        
        # Verificar si el estado actual existe en la nueva historia
        if afd_instance.currentState not in afd_instance.states:
            # Si el estado no existe, resetear el juego
            afd_instance.reset()
            request.session['game_state'] = {
                'current_state': afd_instance.currentState,
                'visited_states': afd_instance.visitedStates,
            }

    current_state_obj = afd_instance.get_current_state()
    enhanced_description = gramatica_instance.enhance_description(
        current_state_obj['description'],
        afd_instance.currentState
    )
    available_transitions = afd_instance.get_available_transitions()

    # Los datos se envían a la plantilla como parte del contexto
    from datetime import datetime
    context = {
        'story_text': enhanced_description,
        'current_state': afd_instance.currentState,
        'visited_states': afd_instance.visitedStates,
        'possible_transitions': available_transitions,
        'is_final_state': afd_instance.is_accepting_state(),
        'final_type': current_state_obj.get('finalType', ''),
        'glc_example': gramatica_instance.generate_text(), # Para mostrar un ejemplo en el debug panel
        'timestamp': int(datetime.now().timestamp())  # Para evitar cache del JavaScript
    }
    return render(request, 'game/game.html', context)

def register_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST) # ¡USAR EL NUEVO FORMULARIO!
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('game_view')
    else:
        form = CustomUserCreationForm() # ¡USAR EL NUEVO FORMULARIO!
    return render(request, 'registration/register.html', {'form': form})

@csrf_exempt # Desactiva la protección CSRF para POST en desarrollo.
             # ¡En producción, usa {% csrf_token %} en el HTML y el JS para enviar el token!
def process_choice(request):
    """
    Vista que procesa la elección del usuario (petición POST de AJAX).
    Valida la entrada, actualiza el estado del AFD y devuelve el nuevo estado del juego.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_input = data.get('choice')
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'JSON inválido.'}, status=400)

        if not user_input:
            return JsonResponse({'success': False, 'message': 'La acción no puede estar vacía.'})

        # Cargar el estado del AFD desde la sesión antes de procesar
        if 'game_state' in request.session:
            afd_instance.currentState = request.session['game_state']['current_state']
            afd_instance.visitedStates = request.session['game_state']['visited_states']
            
            # Verificar si el estado actual existe en la nueva historia
            if afd_instance.currentState not in afd_instance.states:
                # Si el estado no existe, resetear el juego
                afd_instance.reset()
                request.session['game_state'] = {
                    'current_state': afd_instance.currentState,
                    'visited_states': afd_instance.visitedStates,
                }
        else:
            # Si por alguna razón no hay estado en la sesión, reiniciar el juego
            afd_instance.reset()
            request.session['game_state'] = {
                'current_state': afd_instance.currentState,
                'visited_states': afd_instance.visitedStates,
            }

        available_transitions = afd_instance.get_available_transitions()
        is_valid, chosen_transition = gramatica_instance.validate_input(user_input, available_transitions)

        if is_valid and chosen_transition:
            if afd_instance.transition(chosen_transition):
                # Guardar el nuevo estado del juego en la sesión
                request.session['game_state']['current_state'] = afd_instance.currentState
                request.session['game_state']['visited_states'] = afd_instance.visitedStates
                request.session.modified = True # Importante para que Django guarde los cambios en la sesión

                current_state_obj = afd_instance.get_current_state()
                enhanced_description = gramatica_instance.enhance_description(
                    current_state_obj['description'],
                    afd_instance.currentState
                )
                response_data = {
                    'success': True,
                    'story_text': enhanced_description,
                    'current_state': afd_instance.currentState,
                    'visited_states': afd_instance.visitedStates,
                    'possible_transitions': afd_instance.get_available_transitions(),
                    'is_final_state': afd_instance.is_accepting_state(),
                    'final_type': current_state_obj.get('finalType', ''),
                    'glc_example': gramatica_instance.generate_text(),
                }
                return JsonResponse(response_data)
            else:
                return JsonResponse({'success': False, 'message': 'Transición no válida por el AFD.'})
        else:
            # Puedes ser más específico aquí si quieres darle pistas al usuario
            return JsonResponse({'success': False, 'message': f'"{user_input}" no es una acción válida. Intenta con una de las opciones disponibles.'})
    return JsonResponse({'success': False, 'message': 'Método no permitido.'}, status=405)


@csrf_exempt
def reset_game_view(request):
    if request.method == 'POST':
        afd_instance.reset()
        request.session['game_state'] = {
            'current_state': afd_instance.currentState,
            'visited_states': afd_instance.visitedStates,
        }
        return JsonResponse({'success': True, 'message': 'Juego reiniciado.'})
    return JsonResponse({'success': False, 'message': 'Método no permitido.'}, status=405)


def get_afd_info(request):
    """
    Vista para obtener la información del AFD para la visualización.
    """
    states_data = []
    final_states_count = 0
    total_transitions_count = 0

    for state, details in afd_instance.states.items():
        is_final = details.get('isFinal', False)
        if is_final:
            final_states_count += 1

        transitions = details.get('transitions', {})
        total_transitions_count += len(transitions)

        state_info = {
            'id': state,
            'label': state,
            'isFinal': is_final,
            'transitions': transitions,
            'description': details.get('description', ''),
            'finalType': details.get('finalType', '')
        }
        states_data.append(state_info)

    return JsonResponse({
        'states': states_data,
        'total_states': len(states_data),
        'total_transitions': total_transitions_count,
        'final_states_count': final_states_count,
        'current_state': afd_instance.currentState
    })




def get_game_state(request):
    """Vista que devuelve el estado actual del juego en formato JSON"""
    current_state_obj = afd_instance.get_current_state()
    enhanced_description = gramatica_instance.enhance_description(
        current_state_obj['description'],
        afd_instance.currentState
    )
    available_transitions = afd_instance.get_available_transitions()

    response_data = {
        'story_text': enhanced_description,
        'current_state': afd_instance.currentState,
        'visited_states': afd_instance.visitedStates,
        'possible_transitions': available_transitions,
        'is_final_state': afd_instance.is_accepting_state(),
        'final_type': current_state_obj.get('finalType', ''),
        'glc_example': gramatica_instance.generate_text(),
    }
    return JsonResponse(response_data)