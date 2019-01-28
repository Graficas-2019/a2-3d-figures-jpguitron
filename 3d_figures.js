var projectionMatrix;

var shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute, 
    shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

var duration = 5000; // ms

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
var vertexShaderSource =    
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
var fragmentShaderSource = 
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas)
{
    var gl = null;
    var msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try 
    {
        gl = canvas.getContext("experimental-webgl");
    } 
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;        
 }

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas)
{
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 100);
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -5]);
}

// TO DO: Create the functions for each of the figures.

function createPyramid(gl, translation, rotationAxis)
{    
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    radius = 0.5;
    var triangles = 5;
    verts = [];


    var angle = (2 * Math.PI) / triangles;
    
    for(var i = 0; i < triangles; i++) 
    {

        verts.push(0);
        verts.push(0);
        verts.push(0);

        verts.push(Math.cos(angle*i)*radius);
        verts.push(0);
        verts.push(Math.sin(angle*i) *radius);

        verts.push(Math.cos(angle*(i+1))*radius);
        verts.push(0);
        verts.push(Math.sin(angle*(i+1)) *radius);
    }

    for(var i = 0; i < triangles; i++) 
    {



        verts.push(Math.cos(angle*i)*radius);
        verts.push(0);
        verts.push(Math.sin(angle*i) *radius);

        verts.push(Math.cos(angle*(i+1))*radius);
        verts.push(0);
        verts.push(Math.sin(angle*(i+1)) *radius);

        verts.push(0);
        verts.push(2);
        verts.push(0);
    }


    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var faceColors = [
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],
        [0.5, 0.5, 0.0, 1.0],
        [0.5, 1.0, 1.0, 1.0],
        [0.5, 1.0, 0.0, 1.0],
        [0.0, 1.0, 0.5, 1.0],
        [0.5, 1.0, 0.5, 1.0]
    ];
    var vertexColors = [];
    for (const color of faceColors) 
    {
        for (var j=0; j < 3; j++)
            vertexColors = vertexColors.concat(color);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    var pyramidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);
    var pyramidIndices = [];

    for(var x = 0; x < verts.length/3; x++)
    {
        pyramidIndices .push(x);
    }

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);
    
    var pyramid = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:pyramidIndexBuffer,
            vertSize:3, nVerts:30, colorSize:4, nColors: 30, nIndices:30,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);

    pyramid.update = function()
    {
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return pyramid;
}

function drawFaces(rotationY,verts,m,offsetY)
{
    var angle = (2 * Math.PI) / 5;

    
    for(var i = 0; i < 5; i++) 
    {
        var apothem = Math.sqrt(Math.pow(radius,2) - Math.pow(m,2));

        var v1 = vec3.fromValues(0,0,0);
        
        var angle2 = Math.acos(-1/Math.sqrt(5));
        vec3.rotateZ(v1, v1, vec3.fromValues(0,0,0), angle2);
        vec3.add(v1, v1, vec3.fromValues(-apothem  + apothem*Math.cos(angle2),apothem*Math.sin(Math.PI - angle2),0));
        vec3.rotateY(v1, v1, vec3.fromValues(0,0,0), rotationY);
        vec3.add(v1, v1, vec3.fromValues(0,-offsetY,0));

        verts.push(v1[0]);
        verts.push(v1[1]);
        verts.push(v1[2]);

        var v1 = vec3.fromValues(Math.cos(angle*i)*radius,0,Math.sin(angle*i)*radius);
        vec3.rotateZ(v1, v1, vec3.fromValues(0,0,0), angle2);
        vec3.add(v1, v1, vec3.fromValues(-apothem  + apothem*Math.cos(angle2),apothem*Math.sin(Math.PI - angle2),0));
        vec3.rotateY(v1, v1, vec3.fromValues(0,0,0), rotationY);
        vec3.add(v1, v1, vec3.fromValues(0,-offsetY,0));

        verts.push(v1[0]);
        verts.push(v1[1]);
        verts.push(v1[2]);

        
        var v1 = vec3.fromValues(Math.cos(angle*(i+1))*radius,0,Math.sin(angle*(i+1))*radius);
        vec3.rotateZ(v1, v1, vec3.fromValues(0,0,0), angle2);
        vec3.add(v1, v1, vec3.fromValues(-apothem  + apothem*Math.cos(angle2),apothem*Math.sin(Math.PI - angle2),0));
        vec3.rotateY(v1, v1, vec3.fromValues(0,0,0), rotationY);
        vec3.add(v1, v1, vec3.fromValues(0,-offsetY,0));

        verts.push(v1[0]);
        verts.push(v1[1]);
        verts.push(v1[2]);
    }
    return verts;
}

function createDodecahedron(gl, translation, rotationAxis)
{    
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    var m1 = Math.pow(radius - radius*Math.cos(2*Math.PI/5),2);
    var m2 = Math.pow(radius*Math.sin(2*Math.PI/5),2);
    var m = Math.sqrt(m1+m2)/2;
    radius = 0.5;
    var triangles = 5;
    verts = [];
    var offsetY = radius+m/2;

    var apothem = Math.sqrt(Math.pow(radius,2) - Math.pow(m,2));
    var initialY = -offsetY;
    var angle = (2 * Math.PI) / triangles;
    
    for(var i = 0; i < triangles; i++) 
    {
        verts.push(0);
        verts.push(initialY);
        verts.push(0);

        verts.push(Math.cos(angle*i)*radius);
        verts.push(initialY);
        verts.push(Math.sin(angle*i) *radius);

        verts.push(Math.cos(angle*(i+1))*radius);
        verts.push(initialY);
        verts.push(Math.sin(angle*(i+1)) *radius);
    }
    


    verts = drawFaces(0,verts,m,offsetY);
    verts = drawFaces(2*Math.PI/5,verts,m,offsetY);
    verts = drawFaces(4*Math.PI/5,verts,m,offsetY);
    verts = drawFaces(6*Math.PI/5,verts,m,offsetY);
    verts = drawFaces(8*Math.PI/5,verts,m,offsetY);

    var numVerts = verts.length;

    for(var i = 0; i < numVerts/3; i++) 
    {
        var current = i*3;
        var newVertex = vec3.fromValues(verts[current],verts[current+1],verts[current+2]);
        vec3.rotateZ(newVertex , newVertex , vec3.fromValues(0,0,0), Math.PI);
        verts.push(newVertex[0]);
        verts.push(newVertex[1]);
        verts.push(newVertex[2]);
    }



    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var faceColors = [
        [0.0, 0.0, 1.0, 1.0],
        [0.0, 1.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 1.0, 0.0, 1.0],
        [0.0, 1.0, 1.0, 1.0],
        [1.0, 0.0, 1.0, 1.0],
        [1.0, 1.0, 1.0, 1.0],
        [0.5, 0.5, 0.0, 1.0],
        [0.5, 1.0, 1.0, 1.0],
        [0.5, 1.0, 0.0, 1.0],
        [0.0, 1.0, 0.5, 1.0],
        [0.5, 1.0, 0.5, 1.0]

        
    ];
    var vertexColors = [];
    for (const color of faceColors) 
    {
        for (var j=0; j < 15; j++)
            vertexColors = vertexColors.concat(color);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    var dodecahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dodecahedronIndexBuffer);

    var dodecahedronIndices = [];

    for(var x = 0; x < verts.length/3; x++)
    {
        dodecahedronIndices.push(x);
    }

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dodecahedronIndices), gl.STATIC_DRAW);
    
    var dodecahedron = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:dodecahedronIndexBuffer,
            vertSize:3, nVerts: dodecahedronIndices.length, colorSize:4, nColors: dodecahedronIndices.length, nIndices:dodecahedronIndices.length,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(dodecahedron.modelViewMatrix, dodecahedron.modelViewMatrix, translation);

    dodecahedron.update = function()
    {
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return dodecahedron;
}


function createOctahedron(gl, translation, rotationAxis)
{    
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    radius = 0.5;
    verts = [
        
        0,radius,0,    radius,0,0,     0,0,radius,
        0,radius,0,    -radius,0,0,     0,0,radius,
        0,-radius,0,    -radius,0,0,     0,0,radius,
        0,-radius,0,    radius,0,0,     0,0,radius,

        0,radius,0,    radius,0,0,     0,0,-radius,
        0,radius,0,    -radius,0,0,     0,0,-radius,
        0,-radius,0,    -radius,0,0,     0,0,-radius,
        0,-radius,0,    radius,0,0,     0,0,-radius,

            ];





    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var faceColors = [
        [0.0, 0.0, 1.0, 1.0],
        [0.0, 1.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 1.0, 0.0, 1.0],
        [0.0, 1.0, 1.0, 1.0],
        [1.0, 0.0, 1.0, 1.0],
        [1.0, 1.0, 1.0, 1.0],
        [0.5, 0.5, 0.0, 1.0]
    ];
    var vertexColors = [];
    for (const color of faceColors) 
    {
        for (var j=0; j < 3; j++)
            vertexColors = vertexColors.concat(color);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    var octahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octahedronIndexBuffer);
    var octahedronIndices = [];

    for(var x = 0; x < verts.length/3; x++)
    {
        octahedronIndices .push(x);
    }

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octahedronIndices), gl.STATIC_DRAW);
    
    var octahedron = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:octahedronIndexBuffer,
            vertSize:3, nVerts: octahedronIndices.length, colorSize:4, nColors: octahedronIndices.length, nIndices:octahedronIndices.length,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, translation);
    var sube = 1;
    octahedron.update = function()
    {
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
        var translation = vec3.create();

        

  
        if(this.modelViewMatrix[13] < 2 && sube == 1)
        {
            vec3.set (translation, 0, 0.05, 0.0);
        }
        else if(this.modelViewMatrix[13] > -2)
        {
            vec3.set (translation, 0, -0.05, 0.0);
            sube = 0;
        }
        else
        {
            sube = 1;
        }


            

        mat4.translate (this.modelViewMatrix, this.modelViewMatrix, translation);
    };
    
    return octahedron;
}


function createShader(gl, str, type)
{
    var shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl)
{
    // load and compile the fragment and vertex shader
    var fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    var vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);
    
    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function draw(gl, objs) 
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for(i = 0; i<objs.length; i++)
    {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function run(gl, objs) 
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function() { run(gl, objs); });
    draw(gl, objs);

    for(i = 0; i<objs.length; i++)
        objs[i].update();
}
