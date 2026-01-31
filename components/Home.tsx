import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { generateContractContent } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { Menu, X, ArrowRight, Wallet, CheckSquare, Calendar, Building, Info, FileText, Copy, ChevronUp, ChevronDown } from 'lucide-react';

const Home: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // AI State
    const [freeRole, setFreeRole] = useState('');
    const [laborInfo, setLaborInfo] = useState('');
    const [freeResult, setFreeResult] = useState('');
    const [laborResult, setLaborResult] = useState('');
    const [loadingFree, setLoadingFree] = useState(false);
    const [loadingLabor, setLoadingLabor] = useState(false);
    const [freeOpen, setFreeOpen] = useState(false);
    const [laborOpen, setLaborOpen] = useState(false);

    // Chart Data
    const costData = [
        { name: '공사비', value: 50000000 },
        { name: '부가세(환급불가)', value: 5000000 },
    ];
    const costColors = ['#ebe6e0', '#d97706'];

    const structureData = [
        { name: '수입', value: 100, fill: '#70594c' },
        { name: '비용', value: 65, fill: '#a3846f' },
        { name: '소득', value: 35, fill: '#d97706' },
    ];

    const [costInput, setCostInput] = useState(50000000);

    const handleGenerate = async (type: 'freelancer' | 'labor') => {
        const input = type === 'freelancer' ? freeRole : laborInfo;
        if (!input.trim()) return alert("내용을 입력해주세요.");
        
        if (type === 'freelancer') {
            setLoadingFree(true);
            setFreeOpen(true);
            setFreeResult(""); // Clear previous result
            try {
                const text = await generateContractContent('freelancer', input);
                setFreeResult(text);
            } catch (e: any) {
                setFreeResult(`⚠️ 오류 발생: ${e.message}`);
            }
            setLoadingFree(false);
        } else {
            setLoadingLabor(true);
            setLaborOpen(true);
            setLaborResult(""); // Clear previous result
            try {
                const text = await generateContractContent('labor', input);
                setLaborResult(text);
            } catch (e: any) {
                setLaborResult(`⚠️ 오류 발생: ${e.message}`);
            }
            setLoadingLabor(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("복사되었습니다!");
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row text-brand-800">
            {/* Mobile Header */}
            <header className="md:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-200 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <span className="text-xl">🥊</span>
                    <h1 className="text-lg font-black text-brand-900 tracking-tight">AI 세무 마스터</h1>
                </div>
                <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-brand-700 bg-brand-50 rounded-lg">
                    <Menu className="w-5 h-5" />
                </button>
            </header>

            {/* Mobile Nav Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[60] bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
                    <div className="absolute right-0 top-0 bottom-0 w-3/4 bg-white p-6 shadow-2xl flex flex-col overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-8">
                            <span className="font-black text-brand-900 text-lg">내비게이션</span>
                            <button onClick={() => setMobileMenuOpen(false)} className="text-brand-400"><X className="w-8 h-8" /></button>
                        </div>
                        <ul className="space-y-4 font-bold text-brand-700">
                            <li>
                                <Link to="/payroll" className="flex items-center justify-between p-4 bg-accent text-white rounded-xl shadow-lg active:scale-95 transition-all">
                                    <div className="flex items-center space-x-3">
                                        <Wallet className="w-5 h-5" />
                                        <span>급여관리 바로가기</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </li>
                            <li><a href="#section-ai" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b border-brand-50">✨ AI 계약서 도우미</a></li>
                            <li><a href="#section-duty" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b border-brand-50">⚖️ 세무서 초기 의무</a></li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <nav className="hidden md:flex flex-col w-72 bg-white border-r border-brand-200 h-screen sticky top-0 overflow-y-auto z-40">
                <div className="p-8 border-b border-brand-100">
                    <h1 className="text-2xl font-black text-brand-900 leading-tight">Boxing Gym<br /><span className="text-accent">Tax Master</span></h1>
                    <p className="text-[10px] text-brand-400 mt-2 font-bold uppercase tracking-widest">AI & Payroll</p>
                </div>
                <ul className="flex-1 py-6 space-y-1">
                    <li className="px-6 mb-6">
                        <Link to="/payroll" className="flex items-center justify-between p-3 bg-accent text-white rounded-xl shadow-md hover:bg-accent-dark transition-all group">
                            <div className="flex items-center space-x-2">
                                <Wallet className="w-5 h-5" />
                                <span className="font-bold text-sm">급여관리 시스템</span>
                            </div>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </li>
                    <li><a href="#section-ai" className="block px-8 py-3 text-brand-700 hover:bg-brand-50 hover:text-accent font-bold border-l-4 border-transparent hover:border-accent transition-all">✨ AI 계약서 도우미</a></li>
                    <li><a href="#section-duty" className="block px-8 py-3 text-brand-600 hover:bg-brand-50 hover:text-accent font-medium border-l-4 border-transparent hover:border-accent transition-all">⚖️ 세무서 초기 의무</a></li>
                    <li><a href="#section-interior" className="block px-8 py-3 text-brand-600 hover:bg-brand-50 hover:text-accent font-medium border-l-4 border-transparent hover:border-accent transition-all">🔨 인테리어 부가세</a></li>
                </ul>
            </nav>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-12 overflow-y-auto w-full max-w-7xl mx-auto space-y-12 md:space-y-24">
                
                <section className="text-center md:text-left">
                    <h2 className="text-2xl md:text-4xl font-black text-brand-900 leading-tight">성남시 권투체육관<br /><span className="text-accent underline decoration-accent/20 underline-offset-4">창업 및 세무 마스터</span></h2>
                    <p className="text-sm md:text-base text-brand-500 mt-3 md:mt-4 leading-relaxed max-w-2xl">
                        AI Gemini 3를 활용해 계약서 작성부터 절세 전략까지 한 번에 해결하세요.
                    </p>
                </section>

                {/* Quick Link Card */}
                <section>
                    <Link to="/payroll" className="group flex flex-col md:flex-row items-center md:justify-between p-6 md:p-8 bg-white border-2 border-accent rounded-[2rem] shadow-xl shadow-accent/5 hover:shadow-accent/10 transition-all cursor-pointer">
                        <div className="flex flex-col md:flex-row items-center md:space-x-6 text-center md:text-left">
                            <div className="bg-accent/10 p-4 rounded-full mb-3 md:mb-0 group-hover:bg-accent/20 transition-colors">
                                <Wallet className="w-8 h-8 text-accent" />
                            </div>
                            <div>
                                <h3 className="text-lg md:text-2xl font-black text-brand-900">급여관리 시스템 바로가기</h3>
                                <p className="text-[11px] md:text-sm text-brand-500 mt-1">코치 급여 계산, 3.3% 공제, 명세서 발급</p>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center text-accent font-bold text-xs md:text-base bg-accent/5 px-4 py-2 rounded-full group-hover:bg-accent group-hover:text-white transition-all">
                            <span>이동하기</span>
                            <ArrowRight className="ml-2 w-4 h-4 animate-bounce-x" />
                        </div>
                    </Link>
                </section>

                {/* AI Section */}
                <section id="section-ai" className="scroll-mt-20 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl md:text-2xl font-bold text-brand-900 flex items-center">
                            <span className="text-accent mr-2">✨</span> AI 계약서 도우미 (Gemini 3)
                        </h3>
                        <span className="bg-brand-100 text-brand-600 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-tight">CLEAN TEXT MODE</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                        {/* Freelancer Card */}
                        <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-sm space-y-4 border-l-4 border-l-accent hover:-translate-y-1 transition-transform">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-brand-800 text-lg">프리랜서 위촉계약서</h4>
                                <span className="text-2xl">🤝</span>
                            </div>
                            <p className="text-xs text-brand-400">코치와의 독립적인 파트너십 계약 (3.3%)</p>
                            <input value={freeRole} onChange={e => setFreeRole(e.target.value)} type="text" placeholder="코치 이름 및 역할" className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" />
                            <button onClick={() => handleGenerate('freelancer')} className="w-full bg-accent text-white font-black py-4 rounded-xl shadow-md hover:bg-accent-dark active:scale-95 transition-all">
                                {loadingFree ? '생성 중...' : 'AI 문구 생성'}
                            </button>
                            
                            {freeOpen && (
                                <div className="space-y-3 pt-4 border-t border-brand-100">
                                    <div className={`p-4 bg-stone-50 border border-brand-200 rounded-xl whitespace-pre-wrap word-break-all text-sm h-64 overflow-y-auto custom-scroll ${freeResult.startsWith('⚠️') ? 'text-red-500 font-bold bg-red-50 border-red-100' : ''}`}>
                                        {loadingFree ? <div className="animate-pulse text-brand-400">AI가 작성 중입니다...</div> : freeResult}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => copyToClipboard(freeResult)} className="flex-1 bg-brand-800 hover:bg-brand-900 text-white py-3 rounded-xl text-sm font-bold shadow-sm transition-colors flex justify-center items-center gap-2"><Copy className="w-4 h-4"/> 복사하기</button>
                                        <button onClick={() => setFreeOpen(false)} className="flex-1 bg-brand-200 hover:bg-brand-300 text-brand-700 py-3 rounded-xl text-sm font-bold transition-colors flex justify-center items-center gap-2"><ChevronUp className="w-4 h-4"/>접기</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Labor Card */}
                        <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-sm space-y-4 border-l-4 border-l-brand-800 hover:-translate-y-1 transition-transform">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-brand-800 text-lg">표준 근로계약서</h4>
                                <span className="text-2xl">📄</span>
                            </div>
                            <p className="text-xs text-brand-400">정규직/아르바이트 직원 채용</p>
                            <input value={laborInfo} onChange={e => setLaborInfo(e.target.value)} type="text" placeholder="근로자 이름 및 급여 조건" className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl outline-none focus:border-brand-900 focus:ring-2 focus:ring-brand-900/20 transition-all" />
                            <button onClick={() => handleGenerate('labor')} className="w-full bg-brand-900 text-white font-black py-4 rounded-xl shadow-md hover:bg-black active:scale-95 transition-all">
                                {loadingLabor ? '생성 중...' : 'AI 초안 생성'}
                            </button>

                             {laborOpen && (
                                <div className="space-y-3 pt-4 border-t border-brand-100">
                                    <div className={`p-4 bg-stone-50 border border-brand-200 rounded-xl whitespace-pre-wrap word-break-all text-sm h-64 overflow-y-auto custom-scroll ${laborResult.startsWith('⚠️') ? 'text-red-500 font-bold bg-red-50 border-red-100' : ''}`}>
                                        {loadingLabor ? <div className="animate-pulse text-brand-400">AI가 작성 중입니다...</div> : laborResult}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => copyToClipboard(laborResult)} className="flex-1 bg-brand-800 hover:bg-brand-900 text-white py-3 rounded-xl text-sm font-bold shadow-sm transition-colors flex justify-center items-center gap-2"><Copy className="w-4 h-4"/> 복사하기</button>
                                        <button onClick={() => setLaborOpen(false)} className="flex-1 bg-brand-200 hover:bg-brand-300 text-brand-700 py-3 rounded-xl text-sm font-bold transition-colors flex justify-center items-center gap-2"><ChevronUp className="w-4 h-4"/>접기</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Duty Section */}
                <section id="section-duty" className="scroll-mt-20 space-y-6">
                    <h3 className="text-xl md:text-2xl font-bold text-brand-900 flex items-center">
                        <span className="text-accent mr-2">⚖️</span> 세무서 초기 의무
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-brand-200 hover:-translate-y-1 transition-transform">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-bold text-brand-800 text-sm md:text-base">사업자등록</p>
                                    <p className="text-[11px] md:text-xs text-brand-500 mt-1">20일 내 면세사업자 신청</p>
                                </div>
                                <span className="text-[10px] text-accent font-bold bg-accent/10 px-2 py-1 rounded">필수</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-brand-200 hover:-translate-y-1 transition-transform">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-bold text-brand-800 text-sm md:text-base">계좌/카드 등록</p>
                                    <p className="text-[11px] md:text-xs text-brand-500 mt-1">6개월 내 등록 (가산세 면제)</p>
                                </div>
                                <span className="text-[10px] text-brand-400 font-bold bg-brand-50 px-2 py-1 rounded">필수</span>
                            </div>
                        </div>
                        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 hover:-translate-y-1 transition-transform">
                            <p className="font-bold text-red-800 text-sm md:text-base">현금영수증 의무</p>
                            <p className="text-[11px] md:text-xs text-red-600 mt-2">10만원 이상 현금 시 무조건 발행</p>
                        </div>
                    </div>
                </section>

                {/* Interior Section with Chart */}
                <section id="section-interior" className="scroll-mt-20 space-y-6">
                     <h3 className="text-xl md:text-2xl font-bold text-brand-900 flex items-center">
                        <span className="text-accent mr-2">🔨</span> 인테리어 매입세액
                    </h3>
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-brand-200 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="space-y-4">
                            <label className="block text-[10px] md:text-xs font-bold text-brand-400 uppercase">공사비 입력 (VAT 별도)</label>
                            <div className="flex items-center space-x-2 border-b-2 border-brand-100 pb-2">
                                <input type="number" value={costInput} onChange={e => setCostInput(Number(e.target.value))} className="text-3xl md:text-4xl font-black text-accent w-full bg-transparent outline-none" />
                                <span className="font-bold text-brand-300 text-xl">원</span>
                            </div>
                            <p className="text-xs text-brand-600 leading-relaxed bg-brand-50 p-4 rounded-xl">
                                환급받지 못한 부가세는 <strong>자산(시설장치) 취득원가</strong>에 합산하여 5년 동안 비용(감가상각비)으로 처리하세요.
                            </p>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={[{ name: '공사비', value: costInput }, { name: '부가세', value: costInput * 0.1 }]} 
                                        innerRadius={60} 
                                        outerRadius={80} 
                                        paddingAngle={5} 
                                        dataKey="value"
                                    >
                                        <Cell fill="#ebe6e0" />
                                        <Cell fill="#d97706" />
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="text-center text-xs text-brand-400 mt-2">부가세 10% 자산 처리 시각화</div>
                        </div>
                    </div>
                </section>

                <section id="section-structure" className="scroll-mt-20 space-y-6 pb-16">
                     <h3 className="text-xl md:text-2xl font-bold text-brand-900 flex items-center">
                        <span className="text-accent mr-2">💰</span> 소득세 구조
                    </h3>
                    <div className="bg-brand-900 text-white p-6 md:p-8 rounded-[2rem] shadow-xl">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="space-y-4">
                                <p className="font-bold text-lg md:text-xl">세금 계산 흐름</p>
                                <ul className="text-xs md:text-sm text-brand-200 space-y-2">
                                    <li>1. 매출 - 경비 = <strong>소득금액</strong></li>
                                    <li>2. 소득금액 - 소득공제 = <strong>과세표준</strong></li>
                                    <li>3. 과세표준 × 세율 = <strong>산출세액</strong></li>
                                </ul>
                            </div>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={structureData}>
                                        <XAxis dataKey="name" stroke="#c5b4a5" tick={{fill: '#c5b4a5'}} axisLine={false} tickLine={false} />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {structureData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="text-center text-xs text-brand-300 pb-12 safe-area-bottom">
                    <p>© 2026 Boxing Gym Tax Assistant. Built with React & Gemini.</p>
                </footer>
            </main>
        </div>
    );
};

export default Home;