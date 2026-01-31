import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PayrollDB, Coach } from '../types';
import { Users, Mail, Plus, Trash2, Edit2, X, ArrowLeft, Save } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear().toString();

const Payroll: React.FC = () => {
    const [db, setDb] = useState<PayrollDB>({
        coaches: [],
        years: {},
        rosters: {}
    });
    const [selectedYear, setSelectedYear] = useState<string>(CURRENT_YEAR);
    const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
    const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
    const [activeRosterMonth, setActiveRosterMonth] = useState<number>(0);
    const [saveStatus, setSaveStatus] = useState<string>('');

    // Load Data
    useEffect(() => {
        const saved = localStorage.getItem('boxing_payroll_v6_final');
        if (saved) {
            setDb(JSON.parse(saved));
        } else {
            setDb(prev => ({
                ...prev,
                years: { [CURRENT_YEAR]: {} }
            }));
        }
    }, []);

    // Save Data
    const saveData = useCallback((newDb: PayrollDB) => {
        setDb(newDb);
        localStorage.setItem('boxing_payroll_v6_final', JSON.stringify(newDb));
        setSaveStatus('● 저장됨');
        setTimeout(() => setSaveStatus(''), 2000);
    }, []);

    // --- Logic: Master Coach Management ---
    const [newCoachName, setNewCoachName] = useState('');
    const [newCoachJumin, setNewCoachJumin] = useState('');

    const addNewCoach = () => {
        if (!newCoachName.trim()) return alert("이름을 입력해주세요.");
        if (db.coaches.length >= 20) return alert("최대 20명까지 등록 가능합니다.");

        const newId = 'c_' + Date.now();
        const newCoach: Coach = { id: newId, name: newCoachName, jumin: newCoachJumin };
        
        const newDb = { ...db, coaches: [...db.coaches, newCoach] };
        
        // Auto-add to active year's rosters for convenience
        const year = selectedYear;
        if (!newDb.years[year]) newDb.years[year] = {};
        if (!newDb.years[year][newId]) newDb.years[year][newId] = Array(12).fill(0);

        for (let m = 0; m < 12; m++) {
            const rKey = `${year}-${m}`;
            if (!newDb.rosters[rKey]) newDb.rosters[rKey] = [];
            if (!newDb.rosters[rKey].includes(newId)) newDb.rosters[rKey].push(newId);
        }

        saveData(newDb);
        setNewCoachName('');
        setNewCoachJumin('');
    };

    const deleteCoach = (id: string) => {
        if (confirm("정말 삭제하시겠습니까? 이 코치의 모든 급여 기록이 영구 삭제됩니다.")) {
            const newDb = { ...db };
            newDb.coaches = newDb.coaches.filter(c => c.id !== id);
            Object.keys(newDb.years).forEach(y => {
                if (newDb.years[y][id]) delete newDb.years[y][id];
            });
            Object.keys(newDb.rosters).forEach(k => {
                newDb.rosters[k] = newDb.rosters[k].filter(cid => cid !== id);
            });
            saveData(newDb);
        }
    };

    const updateCoachJumin = (id: string, newVal: string) => {
        const newDb = { ...db };
        const coach = newDb.coaches.find(c => c.id === id);
        if (coach) {
            coach.jumin = newVal;
            saveData(newDb);
        }
    };

    // --- Logic: Roster Management ---
    const addToRoster = (monthIndex: number, coachId: string) => {
        const key = `${selectedYear}-${monthIndex}`;
        const newDb = { ...db };
        if (!newDb.rosters[key]) newDb.rosters[key] = [];
        if (!newDb.rosters[key].includes(coachId)) newDb.rosters[key].push(coachId);
        
        // Ensure data space
        if (!newDb.years[selectedYear]) newDb.years[selectedYear] = {};
        if (!newDb.years[selectedYear][coachId]) newDb.years[selectedYear][coachId] = Array(12).fill(0);
        
        saveData(newDb);
        setIsRosterModalOpen(false);
    };

    const removeFromRoster = (monthIndex: number, coachId: string) => {
        const key = `${selectedYear}-${monthIndex}`;
        const newDb = { ...db };
        if (newDb.rosters[key]) {
            newDb.rosters[key] = newDb.rosters[key].filter(id => id !== coachId);
        }
        saveData(newDb);
    };

    // --- Logic: Amount Updates ---
    const updateAmount = (monthIndex: number, coachId: string, val: string) => {
        const num = parseInt(val.replace(/[^0-9]/g, '')) || 0;
        const newDb = { ...db };
        if (!newDb.years[selectedYear]) newDb.years[selectedYear] = {};
        if (!newDb.years[selectedYear][coachId]) newDb.years[selectedYear][coachId] = Array(12).fill(0);
        newDb.years[selectedYear][coachId][monthIndex] = num;
        saveData(newDb);
    };

    // --- Logic: Dashboard Calcs ---
    const getDashboardStats = () => {
        let yGross = 0, yTax = 0;
        for (let m = 0; m < 12; m++) {
            const roster = db.rosters[`${selectedYear}-${m}`] || [];
            roster.forEach(id => {
                const val = db.years[selectedYear]?.[id]?.[m] || 0;
                yGross += val;
                yTax += Math.floor(val * 0.033);
            });
        }
        return { gross: yGross, tax: yTax, net: yGross - yTax };
    };

    const stats = getDashboardStats();

    // --- Logic: Email ---
    const sendEmail = () => {
        const activeIds = new Set<string>();
        for (let m = 0; m < 12; m++) {
            (db.rosters[`${selectedYear}-${m}`] || []).forEach(id => {
                if ((db.years[selectedYear]?.[id]?.[m] || 0) > 0) activeIds.add(id);
            });
        }
        
        if (activeIds.size === 0) return alert("전송할 데이터가 없습니다.");

        const activeCoaches = db.coaches.filter(c => activeIds.has(c.id));
        let body = `세무사님, 안녕하세요.\n${selectedYear}년도 체육관 인건비 신고자료 송부드립니다.\n\n`;

        body += `■ 1. 코치 인적사항\n===================================\n`;
        activeCoaches.forEach(c => body += `- ${c.name} (${c.jumin || '주민번호 미입력'})\n`);
        body += `===================================\n\n`;

        body += `■ 2. 월별 상세\n`;
        let grandTotal = 0;
        for (let i = 0; i < 12; i++) {
            const roster = db.rosters[`${selectedYear}-${i}`] || [];
            const paid = roster.filter(id => (db.years[selectedYear]?.[id]?.[i] || 0) > 0);
            if (paid.length > 0) {
                body += `\n[${i + 1}월]\n`;
                let mG = 0;
                paid.forEach(id => {
                    const c = db.coaches.find(x => x.id === id);
                    const v = db.years[selectedYear][id][i];
                    body += `- ${c?.name}: ${v.toLocaleString()}원\n`;
                    mG += v;
                });
                body += `* 월 합계: ${mG.toLocaleString()}원\n`;
                grandTotal += mG;
            }
        }
        body += `\n>> 연간 총 지급액: ${grandTotal.toLocaleString()}원`;

        const subject = encodeURIComponent(`[급여신고] ${selectedYear}년도 체육관 인건비 명세서`);
        window.location.href = `mailto:?subject=${subject}&body=${encodeURIComponent(body)}`;
    };

    const availableYears = Object.keys(db.years).sort();
    if (!availableYears.includes(CURRENT_YEAR)) availableYears.push(CURRENT_YEAR);

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 font-sans text-slate-800 pb-24">
            <Link to="/" className="inline-flex items-center mb-4 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> 홈으로
            </Link>

            <header className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-5 sticky top-2 z-40">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        🥊 급여 장부
                    </h1>
                    <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="bg-slate-100 font-bold text-indigo-700 py-1 px-3 rounded-lg border-none outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {availableYears.map(y => <option key={y} value={y}>{y}년 장부</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setIsMasterModalOpen(true)} className="bg-indigo-50 text-indigo-700 border border-indigo-200 py-3 rounded-xl font-bold text-sm hover:bg-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95">
                        <Users className="w-4 h-4" /> 코치 명단 관리
                    </button>
                    <button onClick={sendEmail} className="bg-slate-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-900 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md">
                        <Mail className="w-4 h-4" /> 세무사 전송
                    </button>
                </div>
                <div className="text-right text-[10px] text-green-600 mt-2 h-4 font-medium">{saveStatus}</div>
            </header>

            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-5 text-white shadow-lg mb-6">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-sm font-bold text-indigo-100 opacity-80">올해 누적 지급 현황</h2>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">Total Year</span>
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs text-indigo-200 mb-1">총 실지급액 (세후)</p>
                        <p className="text-3xl font-black tracking-tight">{stats.net.toLocaleString()}원</p>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-indigo-200">총 세전 <span className="text-white font-bold ml-1 text-sm">{stats.gross.toLocaleString()}</span></div>
                        <div className="text-[10px] text-indigo-200">총 세금 <span className="text-red-200 font-bold ml-1 text-sm">{stats.tax.toLocaleString()}</span></div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {Array.from({ length: 12 }).map((_, monthIndex) => {
                    const roster = db.rosters[`${selectedYear}-${monthIndex}`] || [];
                    const activeCoaches = roster.map(id => db.coaches.find(c => c.id === id)).filter((c): c is Coach => !!c);
                    
                    let mGross = 0, mTax = 0, mNet = 0;
                    const rows = activeCoaches.map(c => {
                        const val = db.years[selectedYear]?.[c.id]?.[monthIndex] || 0;
                        const tax = Math.floor(val * 0.033);
                        const net = val - tax;
                        mGross += val; mTax += tax; mNet += net;

                        return (
                            <div key={c.id} className="py-3 border-b border-slate-100 last:border-0">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="font-bold text-slate-700 text-sm">{c.name}</div>
                                    <button onClick={() => removeFromRoster(monthIndex, c.id)} className="text-[10px] text-slate-300 hover:text-red-500 border border-slate-100 hover:border-red-200 px-2 py-0.5 rounded transition-colors">이달 제외</button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <input 
                                            type="tel" 
                                            value={val > 0 ? val.toLocaleString() : ''}
                                            onChange={(e) => updateAmount(monthIndex, c.id, e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-right font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm placeholder-slate-300" 
                                            placeholder="0"
                                        />
                                        <span className="absolute left-2 top-2.5 text-[10px] text-slate-400 font-medium">지급액</span>
                                    </div>
                                    <div className="w-[40%] flex flex-col items-end text-right">
                                        <div className="text-[10px] text-slate-500 mb-0.5">세금(3.3%) <span className="text-red-500 font-medium ml-1">{tax.toLocaleString()}</span></div>
                                        <div className="text-sm font-black text-indigo-700"><span className="text-[10px] text-indigo-300 mr-1 font-normal">차인</span>{net.toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    });

                    return (
                        <div key={monthIndex} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                            <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-black text-slate-800">{monthIndex + 1}월</h3>
                                <button onClick={() => { setActiveRosterMonth(monthIndex); setIsRosterModalOpen(true); }} className="text-xs bg-white border border-slate-200 text-indigo-600 font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-50 shadow-sm">+ 근무자 추가</button>
                            </div>
                            <div className="px-5 py-2">
                                {rows.length > 0 ? rows : <div className="text-center py-6 text-xs text-slate-400">근무 기록이 없습니다.</div>}
                            </div>
                            <div className="bg-indigo-50/50 border-t border-indigo-100 px-5 py-4 mt-2">
                                <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-indigo-900 bg-indigo-100 px-2 py-1 rounded">월말 합계</span></div>
                                <div className="grid grid-cols-3 gap-2 text-center divide-x divide-indigo-200/50">
                                    <div><div className="text-[10px] text-slate-500 mb-1">총 지급액</div><div className="text-sm font-bold text-slate-700">{mGross.toLocaleString()}</div></div>
                                    <div><div className="text-[10px] text-slate-500 mb-1">총 원천세</div><div className="text-sm font-bold text-red-500">{mTax.toLocaleString()}</div></div>
                                    <div><div className="text-[10px] text-indigo-500 font-bold mb-1">총 차인지급액</div><div className="text-base font-black text-indigo-700">{mNet.toLocaleString()}</div></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Master Modal */}
            {isMasterModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                            <h3 className="text-lg font-bold text-slate-800">코치 인적사항 관리</h3>
                            <button onClick={() => setIsMasterModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1 custom-scroll">
                            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mb-6">
                                <h4 className="text-xs font-bold text-indigo-800 mb-3">✨ 신규 코치 등록</h4>
                                <div className="space-y-2">
                                    <input value={newCoachName} onChange={e => setNewCoachName(e.target.value)} type="text" placeholder="이름 (예: 홍길동)" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    <input value={newCoachJumin} onChange={e => setNewCoachJumin(e.target.value)} type="text" placeholder="주민번호 (예: 900101-1******)" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    <button onClick={addNewCoach} className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-indigo-700 mt-2 flex items-center justify-center gap-1"><Plus className="w-4 h-4"/> 등록하기</button>
                                </div>
                            </div>
                            <h4 className="text-xs font-bold text-slate-500 mb-3 ml-1">등록된 코치 명단</h4>
                            <div className="space-y-3">
                                {db.coaches.length === 0 ? <p className="text-center text-slate-400 text-xs py-4">등록된 코치가 없습니다.</p> : 
                                db.coaches.map(c => (
                                    <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-bold text-slate-800">{c.name}</div>
                                                <div className="text-xs text-slate-400 mt-0.5">주민번호: {c.jumin || '-'}</div>
                                            </div>
                                            <button onClick={() => deleteCoach(c.id)} className="text-xs text-red-400 hover:text-red-600 border border-slate-200 px-2 py-1 rounded"><Trash2 className="w-3 h-3"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Roster Modal */}
            {isRosterModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-lg font-bold mb-4">{activeRosterMonth + 1}월 근무자 추가</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto mb-4 custom-scroll">
                            {db.coaches.filter(c => !db.rosters[`${selectedYear}-${activeRosterMonth}`]?.includes(c.id)).length === 0 && <p className="text-slate-400 text-sm text-center py-4">추가 가능한 코치가 없습니다.</p>}
                            {db.coaches.filter(c => !db.rosters[`${selectedYear}-${activeRosterMonth}`]?.includes(c.id)).map(c => (
                                <button key={c.id} onClick={() => addToRoster(activeRosterMonth, c.id)} className="w-full text-left flex justify-between items-center p-3 hover:bg-indigo-50 rounded-xl border border-slate-100 mb-2 group transition-colors">
                                    <span className="font-bold text-slate-700">{c.name}</span>
                                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded group-hover:bg-indigo-200 font-medium">추가 +</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsRosterModalOpen(false)} className="px-4 py-2 text-slate-500 font-medium hover:bg-slate-100 rounded-lg">닫기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payroll;