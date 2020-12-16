let area, gl;
let atributo_posicao;
let modelo_vao;

// o "ponteiro" da variável uniform da matriz lá no shader
//
let uniform_mat;


function cria_contexto() {
    area = document.getElementById("area");
    gl = area.getContext("webgl2");
}


function new_shader(id) {
    let shader_script = document.getElementById(id);
    if (!shader_script) return null;

    let str = shader_script.innerText.trim();

    let shader;
    if (shader_script.type == "fragment-shader")
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    else if (shader_script.type == "vertex-shader")
        shader = gl.createShader(gl.VERTEX_SHADER);
    else return null;

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("Erro no " + shader_script.type + ": \n" +
            gl.getShaderInfoLog(shader)
        );
        return null;
    }
    return shader;
}


function cria_shaders() {
    let frag_shader = new_shader("meu_fragment_shader");
    if (!frag_shader) return false;

    let vert_shader = new_shader("meu_vertex_shader");
    if (!vert_shader) return false;

    let shader_prog = gl.createProgram();
    gl.attachShader(shader_prog, vert_shader);
    gl.attachShader(shader_prog, frag_shader);
    gl.linkProgram(shader_prog);
    if (!gl.getProgramParameter(shader_prog, gl.LINK_STATUS)) {
        alert("Erro ao gerar o shader program");
        return false;
    }

    atributo_posicao = gl.getAttribLocation(shader_prog,
        "in_posicao");

    uniform_mat = gl.getUniformLocation(shader_prog, "matriz");

    gl.useProgram(shader_prog);
    return true;
}


function cria_modelos() {
    // 1 - cria buffer dos vértices (VBO)
    //
    let buffer_vertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_vertices);

    let modelo_dados = [
        // posicao x,y,z
        0.2, 0.0, 0.0,
        -0.2, 0.0, 0.0,
        -0.2, -0.4, 0.0,

    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelo_dados), gl.STATIC_DRAW);

    // 2 - cria o pacote com as especificações dos dados (VAO)
    //
    modelo_vao = gl.createVertexArray();
    gl.bindVertexArray(modelo_vao);

    let tamanho_float = 4;
    let tamanho_vertice = 3 * tamanho_float;

    let offset_posicao = 0;

    gl.enableVertexAttribArray(atributo_posicao);
    gl.vertexAttribPointer(atributo_posicao,
        3, gl.FLOAT, false, tamanho_vertice,
        offset_posicao);

    gl.bindVertexArray(null);
    return true;
}


function configura() {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
}

function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}




function renderiza() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



    let mat = I();

    envia_matriz(uniform_mat, mat);


    gl.bindVertexArray(modelo_vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function renderizaT() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let x = document.querySelector("#TranslateX").value;
    let y = document.querySelector("#TranslateY").value;


    let mat = T(x, y);

    envia_matriz(uniform_mat, mat);
   

    gl.bindVertexArray(modelo_vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}


function renderizaR() {
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let a = document.querySelector("#Rotate").value;
    let mat = R(a);
    
    envia_matriz(uniform_mat, mat);


    gl.bindVertexArray(modelo_vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
 
}
function renderizaS() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let x = document.querySelector("#ScaleX").value;
    let y = document.querySelector("#ScaleY").value;
    let mat = S(x, y);

    envia_matriz(uniform_mat, mat);

    
    gl.bindVertexArray(modelo_vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
   
}



function main() {
    cria_contexto();
    cria_shaders();
    cria_modelos();

    configura();
    renderiza();
}


function upd() {
    renderiza();
}




// funções de matriz...
//
//
//


function mZero() {
    let M = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]];

    return M;
}

function I() {
    let M = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]];

    return M;
}

// TERMINAR DE FAZER...
function R(angulo) {
    let c = Math.cos(degrees_to_radians(angulo));
    let s = Math.sin(degrees_to_radians(angulo));

    let M = [
        [c, -s, 0, 0],
        [s, c, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]];
    return M;
}

// FAZER...
function T(dx, dy) {
    let M = [
        [1, 0, 0, dx],
        [0, 1, 0, dy],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];

    return M;
}

// FAZER...
function S(x, y) {
    let M = [
        [x, 0, 0, 0],
        [0, y, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];

    return M;
}


// passe uma lista de matrizes e elas serão multiplicadas entre si
//
function mat_composicao(lista) {
    let R = I();
    for (let i = 0; i < lista.length; i++)
        R = mat_mul(R, lista[i]);
    return R;
}

// multiplica 2 matrizes 4x4 entre si
//
function mat_mul(M1, M2) {
    let R = mZero();

    for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++)
            for (let k = 0; k < 4; k++)
                R[i][j] += M1[i][k] * M2[k][j];

    return R;
}

// envia a matriz (valores em M) para uma variável uniform mat4
// no shader.
//
function envia_matriz(uniform_mat, M) {
    gl.uniformMatrix4fv(uniform_mat, false, [
        M[0][0], M[1][0], M[2][0], M[3][0],
        M[0][1], M[1][1], M[2][1], M[3][1],
        M[0][2], M[1][2], M[2][2], M[3][2],
        M[0][3], M[1][3], M[2][3], M[3][3]]);
}
