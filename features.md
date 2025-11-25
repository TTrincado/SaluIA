features que tenemos ahora mismo:

- conexión a base de datos de supabase
- login de supabase
- Historial de atenciones clínicas
    - Identificación de paciente, médico residente, médico supervisor
    - Resolución a la que llegó la IA
    - Ley de urgencia: si se aplica o no. En este caso, lo puede asignar la IA, o bien se puede sobreescribir por el usuario
    - columna para ver si está sobreescrito
    - botón para ver detalle
- Detalle de atención clínica
    - 3 cards principales
        - datos del paciente
        - datos del equipo médico involucrado en la atención
        - detalle de la atención: este detalle se genera con el primer formulario, y se actializa en cada edit
    - acciones:
        - edit: permite cambiar los datos del detalle de atención, y también permite agregar detalles extra
        - delete: permite marcar la consulta como "eliminada"
        
        
Cosas a tener en cuenta en la demo:

Demo:

Paciente adulto, con antecedentes mórbidos conocidos de cardiopatía e hipertensión arterial (HTA), es evaluado en servicio de urgencia debido a cuadro de inicio de sintomatología aguda de evolución indeterminada.

Signos Vitales al Ingreso:
Presión Arterial (PA): 120/80 mmHg.
Frecuencia Cardíaca (FC): 88 lpm.
Saturación de Oxígeno (SatO2): 96%.
Temperatura (T): 36.9°C.

Hallazgos Clínicos y de Laboratorio:
El monitoreo revela un Electrocardiograma (ECG) con trazado alterado (cambios sugerentes de isquemia/lesión).
Exámenes de laboratorio confirman daño miocárdico agudo, evidenciando niveles de troponinas marcadamente elevados.


anotar la confianza de la IA


administrador
- métricas por médico
- administrador vería lo mismo pero para todos
- 


necesitamos created_at y updated_at

tener cerca el campo de texto donde el médico


el episodio es un ID de la atención. Les importa poder cruzar por episodio
el excel tiene pertinencia por episodio

pertinencia es que sí aplicaba ley de urgencia
poder comparar pertinencia en cada entrada. Poder revisar por la IA 

queremos señalar de forma manual: este fue pertinente.

Poder avanzar con temas de las métricas

mandar un correo
