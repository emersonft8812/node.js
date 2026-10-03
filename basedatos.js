// SQLite viene incluido en Node.js 22.13 o superior: no hay que instalar nada.
const { DatabaseSync } = require("node:sqlite");

// 1. Abrir (o crear) la base de datos. Se guarda en el archivo "datos.db"
const db = new DatabaseSync("datos.db");

// 2. Crear las tablas (si no existen todavía)
db.exec(`
  CREATE TABLE IF NOT EXISTS cursos (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS estudiantes (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre   TEXT NOT NULL,
    edad     INTEGER,
    curso_id INTEGER,
    FOREIGN KEY (curso_id) REFERENCES cursos(id)
  );
`);

// 3. Empezar siempre desde cero para que el ejemplo se pueda repetir
db.exec("DELETE FROM estudiantes; DELETE FROM cursos;");
db.exec("DELETE FROM sqlite_sequence WHERE name IN ('cursos','estudiantes');");

// 4. Insertar datos (INSERT)
const nuevoCurso = db.prepare("INSERT INTO cursos (nombre) VALUES (?)");
nuevoCurso.run("Programación");
nuevoCurso.run("Bases de datos");

const nuevoEstudiante = db.prepare(
  "INSERT INTO estudiantes (nombre, edad, curso_id) VALUES (?, ?, ?)"
);
nuevoEstudiante.run("Ana", 20, 1);
nuevoEstudiante.run("Luis", 22, 1);
nuevoEstudiante.run("Marta", 19, 2);
nuevoEstudiante.run("Pedro", 25, 2);

// 5. Consultas (SELECT)
console.log("\n--- Todos los estudiantes ---");
console.table(db.prepare("SELECT * FROM estudiantes").all());

console.log("--- Mayores de 20 años (WHERE) ---");
console.table(db.prepare("SELECT nombre, edad FROM estudiantes WHERE edad > 20").all());

console.log("--- Ordenados por edad (ORDER BY) ---");
console.table(
  db.prepare("SELECT nombre, edad FROM estudiantes ORDER BY edad DESC").all()
);

console.log("--- Estudiante con su curso (JOIN) ---");
console.table(
  db
    .prepare(
      `SELECT estudiantes.nombre AS estudiante, cursos.nombre AS curso
       FROM estudiantes
       JOIN cursos ON estudiantes.curso_id = cursos.id`
    )
    .all()
);

console.log("--- Cuántos estudiantes hay por curso (GROUP BY) ---");
console.table(
  db
    .prepare(
      `SELECT cursos.nombre AS curso, COUNT(*) AS total
       FROM estudiantes
       JOIN cursos ON estudiantes.curso_id = cursos.id
       GROUP BY cursos.id`
    )
    .all()
);

// 6. Modificar datos (UPDATE) y borrar datos (DELETE)
db.prepare("UPDATE estudiantes SET edad = 21 WHERE nombre = ?").run("Ana");
db.prepare("DELETE FROM estudiantes WHERE nombre = ?").run("Pedro");

console.log("--- Después de actualizar a Ana y borrar a Pedro ---");
console.table(db.prepare("SELECT * FROM estudiantes").all());

// 7. Cerrar la base de datos
db.close();
