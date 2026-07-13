import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import AdminPanel from './pages/AdminPanel';
import RSIDSearch from './pages/RSIDSearch';
import './index.css';

function ShaderBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!window.THREE) return;
    const THREE = window.THREE;
    const container = containerRef.current;
    if (!container) return;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    const vertexShader = `
        varying vec2 v_texCoord;
        void main() {
            v_texCoord = uv;
            gl_Position = vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        varying vec2 v_texCoord;

        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {
            vec2 uv = v_texCoord;
            vec2 mouse = u_mouse / u_resolution;
            float n1 = snoise(uv * 2.0 + u_time * 0.1);
            float n2 = snoise(uv * 4.0 - u_time * 0.15) * 0.5;
            float n3 = snoise(uv * 8.0 + u_time * 0.2) * 0.25;
            float organic = n1 + n2 + n3;
            float dist = distance(uv, mouse);
            float mouseGlow = 0.02 / (dist + 0.15);
            vec3 deepBackground = vec3(0.02, 0.03, 0.06);
            vec3 cyan = vec3(0.0, 0.95, 1.0);
            vec3 magenta = vec3(1.0, 0.0, 1.0);
            vec3 color = mix(deepBackground, cyan, max(0.0, organic * 0.2));
            color = mix(color, magenta, max(0.0, snoise(uv * 3.0 - u_time * 0.1) * 0.1));
            float pulse = sin(u_time * 0.5) * 0.5 + 0.5;
            color += cyan * mouseGlow * 0.4;
            color += cyan * (smoothstep(0.4, 0.6, organic) * 0.05 * pulse);
            gl_FragColor = vec4(color, 1.0);
        }
    `;

    const uniforms = {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2() },
        u_mouse: { value: new THREE.Vector2() }
    };

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const resize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h);
        uniforms.u_resolution.value.set(w, h);
    };

    const onMouseMove = (e) => {
        uniforms.u_mouse.value.set(e.clientX, window.innerHeight - e.clientY);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', resize);
    resize();

    let animationId;
    const animate = (time) => {
        uniforms.u_time.value = time * 0.001;
        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div id="bg-canvas-container" ref={containerRef} />;
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('geneshield_token');
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const token = localStorage.getItem('geneshield_token');
  if (!token) return <Navigate to="/login" replace />;
  const user = JSON.parse(localStorage.getItem('geneshield_user') || '{}');
  return user.isAdmin ? children : <Navigate to="/dashboard" replace />;
}

function PublicOnlyRoute({ children }) {
  const token = localStorage.getItem('geneshield_token');
  return token ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ShaderBackground />
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/search" element={<RSIDSearch />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/report/:id" element={<ProtectedRoute><Report /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
