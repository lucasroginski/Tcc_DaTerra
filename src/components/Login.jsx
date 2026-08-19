import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Lock, Leaf } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const result = login(email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  if (showRegister) {
    return <Register onBack={() => setShowRegister(false)} />;
  }

  return (
    <div className="min-h-screen bg-sage-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="bg-sage-500 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Leaf className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-sage-700 mb-2">DaTerra</h1>
          <p className="text-gray-500">Gestão para Produtores Regionais</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-sage-500 hover:bg-sage-600 text-white rounded-lg p-3 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            Entrar
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-500">
            Não tem conta?{' '}
            <button
              onClick={() => setShowRegister(true)}
              className="text-sage-600 hover:text-sage-700 font-semibold"
            >
              Cadastre-se
            </button>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-sage-50 rounded-lg">
          <p className="text-xs text-gray-600 font-semibold mb-2">Credenciais de Demonstração:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Produtor:</strong> joao@daterra.com / admin123</p>
            <p><strong>Cliente:</strong> carlos@email.com / cliente123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Register = ({ onBack }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('client');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    const result = register(name, email, password, role);
    if (!result.success) {
      setError(result.error);
    } else {
      // Auto login after registration
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-sage-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-honey-500 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <User className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-sage-700 mb-2">Criar Conta</h1>
          <p className="text-gray-500">Junte-se ao DaTerra</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
              placeholder="Seu nome"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Conta</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  role === 'client'
                    ? 'border-sage-500 bg-sage-50 text-sage-700'
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                <p className="font-semibold">Cliente</p>
                <p className="text-xs">Comprar produtos</p>
              </button>
              <button
                type="button"
                onClick={() => setRole('producer')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  role === 'producer'
                    ? 'border-sage-500 bg-sage-50 text-sage-700'
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                <p className="font-semibold">Produtor</p>
                <p className="text-xs">Vender produtos</p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-honey-500 hover:bg-honey-600 text-white rounded-lg p-3 transition-colors font-semibold"
          >
            Cadastrar
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="text-sage-600 hover:text-sage-700 font-semibold"
          >
            ← Voltar para Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
