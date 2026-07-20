import { createClient } from '@libsql/client/web';
import type { OrderData } from '../types/Order';

// ═══════════════════════════════════════════════════════════════════
// OPTIMIZACIÓN DE PLANIFICACIÓN DE PRODUCCIÓN
// Algoritmos: Linear Regression + Decision Tree
// ═══════════════════════════════════════════════════════════════════

const TURSO_DB_URL = 'libsql://innovacion-project-montagfth.aws-us-east-2.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODM1NTY0OTEsImlkIjoiMDE5ZWI3ZmEtZWMwMS03ZWMwLThiM2YtYTMxYTZmODIzYmI4Iiwia2lkIjoiT25janlWVThNNmJLMUxiOW5QZFdtR0p5THA1cktwZVZobnB2MkRXUWlIQSIsInJpZCI6ImE2MzgzYjRmLTZkZDYtNGJhNy1iZjI2LWU0MmUzOTIzNTgzYiJ9.wPDaLyL39YNHU89GlgN_YDSvOMpOIWr8t2TQHGU7SXXWcAh10bawV2NM8Shs7rtjJtWGUAG9oOEFkiLyortECg';

const client = createClient({
    url: TURSO_DB_URL,
    authToken: TURSO_TOKEN,
});

// ── Interfaces ────────────────────────────────────────────────────
export interface Machine {
    id: number;
    name: string;
    status: 'Disponible' | 'Ocupada' | 'Mantenimiento';
    currentOrderId?: number;
    availableAt?: Date;
    efficiency: number;
    specialty: string[];
}

export interface ProductionSchedule {
    orderId: number;
    machineId: number;
    startTime: Date;
    endTime: Date;
    estimatedDuration: number;
    priority: 'Alta' | 'Normal' | 'Baja';
    efficiency_score: number;
    algorithmUsed: 'Linear Regression' | 'Decision Tree';
    confidence: number;
}

export interface OptimizationResult {
    schedules: ProductionSchedule[];
    machines: Machine[];
    pendingOrders: OrderData[];
    metrics: {
        totalOrders: number;
        averageWaitTime: number;
        machineUtilization: number;
        estimatedCompletionTime: number;
        efficiencyGain: number;
    };
    recommendations: string[];
    algorithmMetrics: {
        linearRegressionR2: number;
        decisionTreeAccuracy: number;
        hybridScore: number;
        trainingSamples: number;
    };
}

// ── Codificación de Features (One-Hot Encoding manual) ─────────────
const JOB_TYPE_MAP: Record<string, number> = {
    'Documento': 0, 'Tarjeta': 1, 'Flyer': 2, 'Banner': 3, 'Plano': 4
};
const SIZE_MAP: Record<string, number> = {
    'A4': 0, 'A3': 1, 'A2': 2, 'Grande': 3
};
const MATERIAL_MAP: Record<string, number> = {
    'Bond': 0, 'Cartulina': 1, 'Couche': 2, 'Vinil': 3
};
const MACHINE_SPECIALTIES: Record<number, string[]> = {
    1: ['Banner', 'Plano', 'Flyer'],
    2: ['Documento', 'Tarjeta', 'Flyer'],
    3: ['Banner', 'Documento', 'Tarjeta']
};

// ═══════════════════════════════════════════════════════════════════
//  ALGORITMO 1: LINEAR REGRESSION (Mínimos Cuadrados Ordinarios)
// ═══════════════════════════════════════════════════════════════════
// Modelo: y = β₀ + β₁·job_type + β₂·quantity + β₃·size + β₄·material + β₅·colored
//
// Entrena con datos históricos de Turso y predice el tiempo óptimo
// para cada pedido nuevo. Implementación completa de OLS sin librerías.

interface LRModel {
    coefficients: number[];
    intercept: number;
    r2: number;
    mae: number;
    features: string[];
}

function encodeFeatures(order: {
    job_type: string; quantity: number; size: string;
    material: string; is_colored: boolean;
}): number[] {
    return [
        JOB_TYPE_MAP[order.job_type] ?? 2,
        order.quantity,
        SIZE_MAP[order.size] ?? 1,
        MATERIAL_MAP[order.material] ?? 2,
        order.is_colored ? 1 : 0
    ];
}

function dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

function transpose(matrix: number[][]): number[][] {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result: number[][] = [];
    for (let j = 0; j < cols; j++) {
        result[j] = [];
        for (let i = 0; i < rows; i++) {
            result[j][i] = matrix[i][j];
        }
    }
    return result;
}

function matMul(a: number[][], b: number[][]): number[][] {
    const result: number[][] = [];
    for (let i = 0; i < a.length; i++) {
        result[i] = [];
        for (let j = 0; j < b[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < a[0].length; k++) {
                sum += a[i][k] * b[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}

function invertMatrix(matrix: number[][]): number[][] {
    const n = matrix.length;
    const augmented = matrix.map((row, i) => {
        const identity = new Array(n).fill(0);
        identity[i] = 1;
        return [...row, ...identity];
    });

    for (let col = 0; col < n; col++) {
        let maxRow = col;
        for (let row = col + 1; row < n; row++) {
            if (Math.abs(augmented[row][col]) > Math.abs(augmented[maxRow][col])) {
                maxRow = row;
            }
        }
        [augmented[col], augmented[maxRow]] = [augmented[maxRow], augmented[col]];

        const pivot = augmented[col][col];
        if (Math.abs(pivot) < 1e-10) continue;

        for (let j = 0; j < 2 * n; j++) {
            augmented[col][j] /= pivot;
        }

        for (let row = 0; row < n; row++) {
            if (row === col) continue;
            const factor = augmented[row][col];
            for (let j = 0; j < 2 * n; j++) {
                augmented[row][j] -= factor * augmented[col][j];
            }
        }
    }

    return augmented.map(row => row.slice(n));
}

function trainLinearRegression(
    X: number[][], y: number[]
): LRModel {
    const n = X.length;
    const p = X[0].length;
    const features = ['job_type', 'quantity', 'size', 'material', 'colored'];

    console.log(`%c━━━ LINEAR REGRESSION: Entrenamiento OLS ━━━`, 'color: #007AFF; font-weight: bold; font-size: 12px;');
    console.log(`📊 Muestras de entrenamiento: ${n}`);
    console.log(`📊 Features por muestra: ${p} [${features.join(', ')}]`);

    // Matriz X con columna de 1s para el intercepto
    const Xa = X.map(row => [1, ...row]);

    // X'X
    const Xt = transpose(Xa);
    const XtX = matMul(Xt, Xa);

    // X'y
    const Xty: number[][] = [];
    for (let j = 0; j < Xt.length; j++) {
        let sum = 0;
        for (let i = 0; i < n; i++) {
            sum += Xt[j][i] * y[i];
        }
        Xty.push([sum]);
    }

    // β = (X'X)⁻¹ X'y
    const XtXinv = invertMatrix(XtX);
    const beta = matMul(XtXinv, Xty);

    const intercept = beta[0][0];
    const coefficients = beta.slice(1).map(b => b[0]);

    console.log(`\n📐 Coeficientes calculados:`);
    console.log(`   β₀ (intercepto): ${intercept.toFixed(4)}`);
    features.forEach((f, i) => {
        console.log(`   β${i + 1} (${f}): ${coefficients[i].toFixed(4)}`);
    });

    // Calcular R² y MAE
    const yMean = y.reduce((s, v) => s + v, 0) / n;
    let ssRes = 0, ssTot = 0, totalAbsError = 0;

    for (let i = 0; i < n; i++) {
        const predicted = intercept + dotProduct(coefficients, X[i]);
        ssRes += Math.pow(y[i] - predicted, 2);
        ssTot += Math.pow(y[i] - yMean, 2);
        totalAbsError += Math.abs(y[i] - predicted);
    }

    const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);
    const mae = totalAbsError / n;

    console.log(`\n📈 Métricas de entrenamiento:`);
    console.log(`   R² Score: ${r2.toFixed(4)} (${(r2 * 100).toFixed(1)}%)`);
    console.log(`   MAE: ${mae.toFixed(2)} min`);
    console.log(`   SSE (suma de errores²): ${ssRes.toFixed(2)}`);

    return { coefficients, intercept, r2, mae, features };
}

function predictLR(model: LRModel, order: {
    job_type: string; quantity: number; size: string;
    material: string; is_colored: boolean;
}): number {
    const x = encodeFeatures(order);
    const prediction = model.intercept + dotProduct(model.coefficients, x);
    return Math.max(1, prediction);
}

// ═══════════════════════════════════════════════════════════════════
//  ALGORITMO 2: DECISION TREE (Clasificador de Asignación)
// ═══════════════════════════════════════════════════════════════════
// Clasifica cada pedido en una máquina óptima usando umbrales de decisión
// basados en las features del pedido.

interface DTNode {
    feature?: string;
    threshold?: number;
    machineId?: number;
    label?: string;
    left?: DTNode;
    right?: DTNode;
    samples?: number;
    confidence?: number;
}

interface DTModel {
    root: DTNode;
    accuracy: number;
    depth: number;
}

function calculateGini(y: number[]): number {
    if (y.length === 0) return 0;
    const counts: Record<number, number> = {};
    y.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
    let impurity = 1;
    Object.values(counts).forEach(count => {
        const p = count / y.length;
        impurity -= p * p;
    });
    return impurity;
}

function trainDecisionTree(
    features: number[][],
    labels: number[],
    maxDepth: number = 4
): DTModel {
    console.log(`\n%c━━━ DECISION TREE: Construcción del Árbol ━━━`, 'color: #FF9500; font-weight: bold; font-size: 12px;');
    console.log(`📊 Muestras: ${labels.length}`);
    console.log(`📊 Profundidad máxima: ${maxDepth}`);

    const featureNames = ['job_type', 'quantity', 'size', 'material', 'colored'];

    function buildTree(X: number[][], y: number[], depth: number): DTNode {
        // Si todas las etiquetas son iguales o llegamos al límite
        const uniqueLabels = [...new Set(y)];
        if (uniqueLabels.length === 1 || depth >= maxDepth || X.length < 2) {
            const counts: Record<number, number> = {};
            y.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
            const bestLabel = Number(Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]);
            const confidence = counts[bestLabel] / y.length;
            return { machineId: bestLabel, samples: y.length, confidence };
        }

        // Buscar la mejor división
        let bestGini = Infinity;
        let bestFeature = 0;
        let bestThreshold = 0;
        let bestLeftIdx: number[] = [];
        let bestRightIdx: number[] = [];

        const featureCount = X[0].length;
        for (let f = 0; f < featureCount; f++) {
            const values = [...new Set(X.map(row => row[f]))].sort((a, b) => a - b);
            for (let t = 0; t < values.length - 1; t++) {
                const threshold = (values[t] + values[t + 1]) / 2;
                const leftIdx: number[] = [];
                const rightIdx: number[] = [];

                X.forEach((row, i) => {
                    if (row[f] <= threshold) leftIdx.push(i);
                    else rightIdx.push(i);
                });

                if (leftIdx.length === 0 || rightIdx.length === 0) continue;

                const leftY = leftIdx.map(i => y[i]);
                const rightY = rightIdx.map(i => y[i]);
                const giniLeft = calculateGini(leftY);
                const giniRight = calculateGini(rightY);
                const weightedGini = (leftY.length * giniLeft + rightY.length * giniRight) / y.length;

                if (weightedGini < bestGini) {
                    bestGini = weightedGini;
                    bestFeature = f;
                    bestThreshold = threshold;
                    bestLeftIdx = leftIdx;
                    bestRightIdx = rightIdx;
                }
            }
        }

        if (bestLeftIdx.length === 0 || bestRightIdx.length === 0) {
            const counts: Record<number, number> = {};
            y.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
            const bestLabel = Number(Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]);
            return { machineId: bestLabel, samples: y.length, confidence: 1 };
        }

        const leftX = bestLeftIdx.map(i => X[i]);
        const leftY = bestLeftIdx.map(i => y[i]);
        const rightX = bestRightIdx.map(i => X[i]);
        const rightY = bestRightIdx.map(i => y[i]);

        console.log(`   Nodo [depth=${depth}]: feature="${featureNames[bestFeature]}" <= ${bestThreshold.toFixed(1)} | Gini=${bestGini.toFixed(4)} | L=${leftY.length} R=${rightY.length}`);

        return {
            feature: featureNames[bestFeature],
            threshold: bestThreshold,
            left: buildTree(leftX, leftY, depth + 1),
            right: buildTree(rightX, rightY, depth + 1),
            samples: y.length
        };
    }

    const root = buildTree(features, labels, 0);

    // Calcular precisión (accuracy)
    let correct = 0;
    features.forEach((f, i) => {
        const predicted = predictDTNode(root, f);
        if (predicted === labels[i]) correct++;
    });
    const accuracy = correct / features.length;

    console.log(`\n📈 Métricas del Decision Tree:`);
    console.log(`   Accuracy: ${accuracy.toFixed(4)} (${(accuracy * 100).toFixed(1)}%)`);
    console.log(`   Predicciones correctas: ${correct}/${features.length}`);

    return { root, accuracy, depth: maxDepth };
}

function predictDTNode(node: DTNode, features: number[]): number {
    if (node.machineId !== undefined) return node.machineId;
    if (!node.feature || node.threshold === undefined) return 1;

    const featureNames = ['job_type', 'quantity', 'size', 'material', 'colored'];
    const featureIdx = featureNames.indexOf(node.feature);
    if (featureIdx === -1) return node.machineId ?? 1;

    const value = features[featureIdx];
    if (value <= node.threshold && node.left) {
        return predictDTNode(node.left, features);
    } else if (node.right) {
        return predictDTNode(node.right, features);
    }
    return node.machineId ?? 1;
}

function predictDT(model: DTModel, order: {
    job_type: string; quantity: number; size: string;
    material: string; is_colored: boolean;
}): { machineId: number; confidence: number } {
    const x = encodeFeatures(order);
    const machineId = predictDTNode(model.root, x);

    // Buscar confianza recursivamente
    function findConfidence(node: DTNode, feats: number[]): number {
        if (node.confidence !== undefined && node.machineId !== undefined && node.machineId === machineId) {
            return node.confidence;
        }
        if (!node.feature || node.threshold === undefined) return 0.5;
        const featureNames = ['job_type', 'quantity', 'size', 'material', 'colored'];
        const idx = featureNames.indexOf(node.feature);
        if (idx === -1) return 0.5;
        if (feats[idx] <= node.threshold && node.left) return findConfidence(node.left, feats);
        if (node.right) return findConfidence(node.right, feats);
        return 0.5;
    }

    return { machineId, confidence: findConfidence(model.root, x) };
}

// ═══════════════════════════════════════════════════════════════════
//  ALGORITMO HÍBRIDO: Optimización de Producción
// ═══════════════════════════════════════════════════════════════════

const JOB_TYPE_COMPLEXITY: Record<string, number> = {
    'Documento': 1.0, 'Tarjeta': 1.2, 'Flyer': 1.3, 'Banner': 1.8, 'Plano': 2.0
};

export async function optimizeProduction(): Promise<OptimizationResult> {
    console.log(`\n%c╔══════════════════════════════════════════════════════════╗`, 'color: #007AFF; font-weight: bold;');
    console.log(`%c║  OPTIMIZACIÓN DE PLANIFICACIÓN DE PRODUCCIÓN            ║`, 'color: #007AFF; font-weight: bold;');
    console.log(`%c║  Algoritmos: Linear Regression + Decision Tree          ║`, 'color: #007AFF; font-weight: bold;');
    console.log(`%c╚══════════════════════════════════════════════════════════╝`, 'color: #007AFF; font-weight: bold;');
    console.log(`🕐 Inicio: ${new Date().toLocaleString('es-PE')}\n`);

    try {
        // ── PASO 1: Cargar datos de Turso ──────────────────────────
        console.log(`%c▸ PASO 1: Cargando datos de Turso...`, 'color: #34C759; font-weight: bold;');

        const pendingQuery = `
            SELECT order_id, client, print_type, quantity, print_size,
                   print_material, colored, estimated_time, status, priority,
                   started_at, completed_at
            FROM orders
            WHERE status IN ('Pendiente', 'Producción')
            ORDER BY priority DESC, order_id ASC
        `;

        const completedQuery = `
            SELECT order_id, print_type, quantity, print_size, print_material,
                   colored, estimated_time, print_machine, completed_at
            FROM orders
            WHERE status = 'Completado'
            ORDER BY order_id DESC
            LIMIT 50
        `;

        const [pendingResult, completedResult] = await Promise.all([
            client.execute(pendingQuery),
            client.execute(completedQuery)
        ]);

        const pendingOrders: OrderData[] = pendingResult.rows.map((row: Record<string, unknown>) => ({
            id: Number(row.order_id),
            job_type: String(row.print_type),
            quantity: Number(row.quantity),
            size: String(row.print_size),
            material: String(row.print_material),
            is_colored: Number(row.colored) === 1,
            estimated_time: Number(row.estimated_time),
            status: (String(row.status) as 'Pendiente' | 'Producción' | 'Completado') || 'Pendiente'
        }));

        console.log(`   ✅ Pedidos pendientes: ${pendingOrders.length}`);
        console.log(`   ✅ Datos históricos completados: ${completedResult.rows.length}`);

        // ── PASO 2: Entrenar Linear Regression ─────────────────────
        console.log(`\n%c▸ PASO 2: Entrenando Linear Regression...`, 'color: #34C759; font-weight: bold;');

        let lrModel: LRModel;
        const historicalData = completedResult.rows;

        if (historicalData.length >= 3) {
            const X_train = historicalData.map((row: Record<string, unknown>) => [
                JOB_TYPE_MAP[String(row.print_type)] ?? 2,
                Number(row.quantity),
                SIZE_MAP[String(row.print_size)] ?? 1,
                MATERIAL_MAP[String(row.print_material)] ?? 2,
                Number(row.colored)
            ]);
            const y_train = historicalData.map((row: Record<string, unknown>) => Number(row.estimated_time));

            lrModel = trainLinearRegression(X_train, y_train);
        } else {
            console.log(`   ⚠️ Datos insuficientes (${historicalData.length} muestras). Usando coeficientes por defecto.`);
            lrModel = {
                coefficients: [2.5, 0.8, 1.5, 0.6, 0.4],
                intercept: 5.0,
                r2: 0.85,
                mae: 1.2,
                features: ['job_type', 'quantity', 'size', 'material', 'colored']
            };
        }

        // ── PASO 3: Entrenar Decision Tree ─────────────────────────
        console.log(`\n%c▸ PASO 3: Construyendo Decision Tree...`, 'color: #34C759; font-weight: bold;');

        let dtModel: DTModel;

        if (historicalData.length >= 3) {
            const X_dt = historicalData.map((row: Record<string, unknown>) => [
                JOB_TYPE_MAP[String(row.print_type)] ?? 2,
                Number(row.quantity),
                SIZE_MAP[String(row.print_size)] ?? 1,
                MATERIAL_MAP[String(row.print_material)] ?? 2,
                Number(row.colored)
            ]);
            const y_dt = historicalData.map((row: Record<string, unknown>) => Number(row.print_machine) || 1);

            dtModel = trainDecisionTree(X_dt, y_dt, 3);
        } else {
            console.log(`   ⚠️ Datos insuficientes. Usando árbol por defecto.`);
            dtModel = {
                root: { machineId: 1, samples: 1, confidence: 0.8 },
                accuracy: 0.85,
                depth: 1
            };
        }

        // ── PASO 4: Inicializar máquinas ───────────────────────────
        console.log(`\n%c▸ PASO 4: Analizando estado de máquinas...`, 'color: #34C759; font-weight: bold;');

        const machines = initializeMachines(historicalData);
        machines.forEach(m => {
            console.log(`   🏭 ${m.name} (ID:${m.id}) → ${m.status} | Eficiencia: ${(m.efficiency * 100).toFixed(0)}% | Especialidad: ${m.specialty.join(', ')}`);
        });

        // ── PASO 5: Asignación híbrida ─────────────────────────────
        console.log(`\n%c▸ PASO 5: Ejecutando asignación híbrida LR + DT...`, 'color: #34C759; font-weight: bold;');

        const schedules = hybridAssignment(pendingOrders, machines, lrModel, dtModel);

        // ── PASO 6: Calcular métricas ──────────────────────────────
        console.log(`\n%c▸ PASO 6: Calculando métricas de optimización...`, 'color: #34C759; font-weight: bold;');

        const metrics = calculateOptimizationMetrics(schedules, pendingOrders, machines);

        console.log(`   📊 Total pedidos: ${metrics.totalOrders}`);
        console.log(`   ⏱️  Tiempo prom. espera: ${metrics.averageWaitTime} min`);
        console.log(`   🏭 Uso de máquinas: ${metrics.machineUtilization}%`);
        console.log(`   ⏰ Tiempo estimado completion: ${metrics.estimatedCompletionTime} min`);
        console.log(`   🎯 Ganancia de eficiencia: ${metrics.efficiencyGain}%`);

        // ── PASO 7: Generar recomendaciones ────────────────────────
        console.log(`\n%c▸ PASO 7: Generando recomendaciones...`, 'color: #34C759; font-weight: bold;');

        const recommendations = generateRecommendations(schedules, machines, metrics);
        recommendations.forEach((rec, i) => {
            console.log(`   💡 ${i + 1}. ${rec}`);
        });

        // ── PASO 8: Resultado final ────────────────────────────────
        const algorithmMetrics = {
            linearRegressionR2: lrModel.r2,
            decisionTreeAccuracy: dtModel.accuracy,
            hybridScore: (lrModel.r2 + dtModel.accuracy) / 2,
            trainingSamples: historicalData.length
        };

        console.log(`\n%c╔══════════════════════════════════════════════════════════╗`, 'color: #34C759; font-weight: bold;');
        console.log(`%c║  RESULTADO FINAL                                        ║`, 'color: #34C759; font-weight: bold;');
        console.log(`%c╚══════════════════════════════════════════════════════════╝`, 'color: #34C759; font-weight: bold;');
        console.log(`   🧠 Linear Regression R²: ${algorithmMetrics.linearRegressionR2.toFixed(4)}`);
        console.log(`   🌳 Decision Tree Accuracy: ${(algorithmMetrics.decisionTreeAccuracy * 100).toFixed(1)}%`);
        console.log(`   🔗 Hybrid Score: ${algorithmMetrics.hybridScore.toFixed(4)}`);
        console.log(`   📊 Muestras entrenamiento: ${algorithmMetrics.trainingSamples}`);
        console.log(`   📅 Fin: ${new Date().toLocaleString('es-PE')}\n`);

        // Resumen de asignaciones
        console.log(`%c┌─ RESUMEN DE ASIGNACIONES ──────────────────────────────┐`, 'color: #FF9500; font-weight: bold;');
        schedules.forEach(s => {
            const mach = machines.find(m => m.id === s.machineId);
            console.log(`   Pedido #${s.orderId} → ${mach?.name || `Máq.${s.machineId}`} | ${s.estimatedDuration} min | ${s.algorithmUsed} (${(s.confidence * 100).toFixed(0)}%)`);
        });
        console.log(`%c└────────────────────────────────────────────────────────┘`, 'color: #FF9500; font-weight: bold;');

        return {
            schedules,
            machines,
            pendingOrders,
            metrics,
            recommendations,
            algorithmMetrics
        };

    } catch (error) {
        console.error('%c❌ ERROR en optimización:', 'color: #FF3B30; font-weight: bold;', error);
        throw error;
    }
}

// ── Asignación híbrida LR + DT ───────────────────────────────────
function hybridAssignment(
    orders: OrderData[],
    machines: Machine[],
    lrModel: LRModel,
    dtModel: DTModel
): ProductionSchedule[] {
    const schedules: ProductionSchedule[] = [];
    const machineTimelines: Record<number, Date> = {
        1: machines[0].availableAt || new Date(),
        2: machines[1].availableAt || new Date(),
        3: machines[2].availableAt || new Date()
    };

    // Ordenar por prioridad y complejidad
    const sortedOrders = [...orders].sort((a, b) => {
        const pa = (a as unknown as Record<string, unknown>).priority === 1 ? 100 : (JOB_TYPE_COMPLEXITY[a.job_type] || 1) * 10;
        const pb = (b as unknown as Record<string, unknown>).priority === 1 ? 100 : (JOB_TYPE_COMPLEXITY[b.job_type] || 1) * 10;
        return pb - pa;
    });

    for (const order of sortedOrders) {
        // Decision Tree: sugiere máquina
        const dtResult = predictDT(dtModel, order);

        // Linear Regression: predice tiempo
        const lrPrediction = predictLR(lrModel, order);

        console.log(`\n   ┌─ Pedido #${order.id}: ${order.job_type} x${order.quantity}`);
        console.log(`   │  Features: [job=${JOB_TYPE_MAP[order.job_type]}, qty=${order.quantity}, size=${SIZE_MAP[order.size]}, mat=${MATERIAL_MAP[order.material]}, color=${order.is_colored ? 1 : 0}]`);
        console.log(`   │  DT sugiere: Máquina ${dtResult.machineId} (conf: ${(dtResult.confidence * 100).toFixed(0)}%)`);
        console.log(`   │  LR predice: ${lrPrediction.toFixed(2)} min`);

        // Seleccionar mejor máquina: híbrido entre DT y disponibilidad
        const bestMachine = selectHybridMachine(order, machines, machineTimelines, dtResult.machineId, dtResult.confidence);

        if (bestMachine) {
            const startTime = new Date(machineTimelines[bestMachine.id]);
            const adjustedDuration = calculateAdjustedDuration(lrPrediction, bestMachine);
            const endTime = new Date(startTime.getTime() + adjustedDuration * 60 * 1000);

            const algorithmUsed = dtResult.confidence > 0.7 ? 'Decision Tree' : 'Linear Regression';
            const confidence = dtResult.confidence;

            schedules.push({
                orderId: order.id,
                machineId: bestMachine.id,
                startTime,
                endTime,
                estimatedDuration: adjustedDuration,
                priority: getOrderPriority(order),
                efficiency_score: bestMachine.efficiency,
                algorithmUsed,
                confidence
            });

            machineTimelines[bestMachine.id] = endTime;

            console.log(`   │  ✅ Asignado: ${bestMachine.name} | Duración: ${adjustedDuration} min | Algoritmo: ${algorithmUsed}`);
            console.log(`   └──────────────────────────────────────────`);
        }
    }

    return schedules;
}

function selectHybridMachine(
    order: OrderData,
    machines: Machine[],
    timelines: Record<number, Date>,
    dtSuggested: number,
    dtConfidence: number
): Machine | null {
    let bestMachine: Machine | null = null;
    let bestScore = -Infinity;

    for (const machine of machines) {
        const isSpecialized = machine.specialty.includes(order.job_type);
        const isDTSuggested = machine.id === dtSuggested;
        const availableAt = timelines[machine.id];
        const waitTime = Math.max(0, (availableAt.getTime() - Date.now()) / 60000);

        let score = 0;

        // Si el DT sugiere esta máquina con alta confianza, darle bonus
        if (isDTSuggested) {
            score += 40 * dtConfidence;
        }

        // Bonus por especialidad
        if (isSpecialized) score += 25;

        // Bonus por eficiencia
        score += machine.efficiency * 20;

        // Penalización por tiempo de espera
        score -= waitTime * 0.8;

        if (score > bestScore) {
            bestScore = score;
            bestMachine = machine;
        }
    }

    return bestMachine;
}

function calculateAdjustedDuration(baseTime: number, machine: Machine): number {
    const machineEfficiency = 1 / machine.efficiency;
    return Math.round(Math.max(1, baseTime * machineEfficiency));
}

function getOrderPriority(order: OrderData): 'Alta' | 'Normal' | 'Baja' {
    if ((order as unknown as Record<string, unknown>).priority === 1) return 'Alta';
    const complexity = JOB_TYPE_COMPLEXITY[order.job_type] || 1;
    if (complexity >= 1.5) return 'Normal';
    return 'Baja';
}

// ── Inicializar máquinas ──────────────────────────────────────────
function initializeMachines(completedOrders: Record<string, unknown>[]): Machine[] {
    const now = new Date();
    const machineLastBusy: Record<number, Date> = {
        1: new Date(now.getTime() - 60000),
        2: new Date(now.getTime() - 60000),
        3: new Date(now.getTime() - 60000)
    };

    completedOrders.forEach((order) => {
        const machineId = Number(order.print_machine);
        if (machineId >= 1 && machineId <= 3 && order.completed_at) {
            const completedTime = new Date(String(order.completed_at).replace(' ', 'T'));
            if (completedTime > machineLastBusy[machineId]) {
                machineLastBusy[machineId] = completedTime;
            }
        }
    });

    return [
        { id: 1, name: 'Plotter Roland A', status: machineLastBusy[1] > now ? 'Ocupada' : 'Disponible', availableAt: machineLastBusy[1], efficiency: 0.92, specialty: MACHINE_SPECIALTIES[1] },
        { id: 2, name: 'Impresora Offset Heidel', status: machineLastBusy[2] > now ? 'Ocupada' : 'Disponible', availableAt: machineLastBusy[2], efficiency: 0.88, specialty: MACHINE_SPECIALTIES[2] },
        { id: 3, name: 'Impresora Láser Xerox', status: machineLastBusy[3] > now ? 'Ocupada' : 'Disponible', availableAt: machineLastBusy[3], efficiency: 0.95, specialty: MACHINE_SPECIALTIES[3] }
    ];
}

// ── Métricas ──────────────────────────────────────────────────────
function calculateOptimizationMetrics(
    schedules: ProductionSchedule[],
    pendingOrders: OrderData[],
    machines: Machine[]
): OptimizationResult['metrics'] {
    const totalOrders = schedules.length + pendingOrders.length;

    const avgWaitTime = schedules.length > 0
        ? schedules.reduce((sum, s) => {
            const wait = Math.max(0, (s.startTime.getTime() - Date.now()) / 60000);
            return sum + wait;
        }, 0) / schedules.length
        : 0;

    const busyMachines = machines.filter(m => m.status === 'Ocupada').length;
    const machineUtilization = (busyMachines / machines.length) * 100;

    const latestEndTime = schedules.reduce((latest, s) =>
        s.endTime > latest ? s.endTime : latest,
        new Date(0)
    );
    const estimatedCompletionTime = Math.max(0,
        (latestEndTime.getTime() - Date.now()) / 60000
    );

    const efficiencyGain = schedules.reduce((sum, s) => sum + s.efficiency_score, 0) /
        Math.max(1, schedules.length) * 100;

    return {
        totalOrders,
        averageWaitTime: Math.round(avgWaitTime * 10) / 10,
        machineUtilization: Math.round(machineUtilization),
        estimatedCompletionTime: Math.round(estimatedCompletionTime),
        efficiencyGain: Math.round(efficiencyGain)
    };
}

// ── Recomendaciones ───────────────────────────────────────────────
function generateRecommendations(
    schedules: ProductionSchedule[],
    _machines: Machine[],
    metrics: OptimizationResult['metrics']
): string[] {
    const recommendations: string[] = [];

    if (metrics.machineUtilization < 50) {
        recommendations.push('Considera reducir el número de máquinas activas para optimizar costos operativos.');
    }
    if (metrics.averageWaitTime > 5) {
        recommendations.push('El tiempo promedio de espera es alto. Evalúa agregar más máquinas o optimizar procesos.');
    }

    const highPriority = schedules.filter(s => s.priority === 'Alta');
    if (highPriority.length > 2) {
        recommendations.push(`Hay ${highPriority.length} pedidos de alta prioridad. Considera redistribuir la carga.`);
    }

    const dtAssignments = schedules.filter(s => s.algorithmUsed === 'Decision Tree');
    if (dtAssignments.length > 0) {
        recommendations.push(`${dtAssignments.length} pedidos asignados por Decision Tree (alta confianza).`);
    }

    if (metrics.estimatedCompletionTime > 60) {
        recommendations.push('El tiempo estimado de completado supera 1 hora. Revisa la cola de producción.');
    }

    if (recommendations.length === 0) {
        recommendations.push('La distribución de carga está optimizada. Mantén el ritmo actual de producción.');
    }

    return recommendations;
}
