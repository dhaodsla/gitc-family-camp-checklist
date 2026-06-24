import { useState, useEffect, useMemo } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Search,
  Share2,
  AlertTriangle,
  Info,
  FileText,
  Briefcase,
  Sparkles,
  Bookmark,
  Smartphone,
  Heart,
  Wallet,
  X,
  Copy,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  Flame,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types definition
interface ChecklistItem {
  id: string;
  category: string;
  name: string;
  required: boolean;
  isNegative?: boolean; // True for "가져오지 않아도 되는 것"
  tip?: string; // Helpful context for parents
}

// 1. Core Checklist Dataset
const CHECKLIST_DATA: ChecklistItem[] = [
  // 0. 출국 전 eTravel 등록
  { id: 'etravel_official_site', category: '출국 전 eTravel 등록', name: 'eTravel 공식 사이트 접속', required: true, tip: '반드시 공식 사이트(etravel.gov.ph)에서 진행하세요 (무료).' },
  { id: 'etravel_parent_registration', category: '출국 전 eTravel 등록', name: '학부모 eTravel 등록 완료', required: true, tip: '학부모 본인의 정보를 기재하고 최종 등록을 마칩니다.' },
  { id: 'etravel_child_registration', category: '출국 전 eTravel 등록', name: '아이 eTravel 등록 완료', required: true, tip: '가족캠프 참가 동행 자녀의 등록을 별도로 새로 진행해 주세요.' },
  { id: 'etravel_parent_qr_save', category: '출국 전 eTravel 등록', name: '학부모 QR코드 캡처 / 저장', required: true, tip: '발급 완료 후 생성된 QR코드를 휴대폰 사진첩에 캡처해 둡니다.' },
  { id: 'etravel_child_qr_save', category: '출국 전 eTravel 등록', name: '아이 QR코드 캡처 / 저장', required: true, tip: '자녀용으로 발급된 개별 QR코드를 각각 별도로 캡처해 둡니다.' },
  { id: 'etravel_confirm_flight', category: '출국 전 eTravel 등록', name: '항공편명 확인', required: true, tip: '이용하시는 항공편 스케줄 및 정확한 비행기 편명을 기재해야 합니다.' },
  { id: 'etravel_confirm_address', category: '출국 전 eTravel 등록', name: '필리핀 체류 주소 확인', required: true, tip: '캠프 숙소 주소(GITC 리조트/어학원)를 입력해야 합니다.' },
  { id: 'etravel_print_qr_code', category: '출국 전 eTravel 등록', name: 'QR코드 출력본 준비', required: false, tip: '안전한 확인을 위해 종이 인쇄본을 여권과 함께 지참하면 좋습니다.' },

  // 1. 여권 / 서류
  { id: 'passport', category: '여권 / 서류', name: '여권', required: true, tip: '만료일이 출국일 기준 6개월 이상 남아있어야 합니다.' },
  { id: 'passport_copy', category: '여권 / 서류', name: '여권 사본', required: true, tip: '분실을 대비해 사진면 복사본 1~2장을 준비하세요.' },
  { id: 'english_resident', category: '여권 / 서류', name: '영문 주민등록등본', required: true, tip: '가족관계 확인용(최근 3개월 이내 발급본).' },
  { id: 'flight_ticket', category: '여권 / 서류', name: '항공권 정보', required: true, tip: 'E-Ticket 출력본 또는 모바일 저장 화면.' },
  { id: 'travel_insurance', category: '여권 / 서류', name: '여행자보험 증서', required: true, tip: '영문 증서를 인쇄하여 지참하세요.' },
  { id: 'guardian_contact', category: '여권 / 서류', name: '보호자 연락처 메모', required: true, tip: '비상 시 사용할 수 있게 수첩 등에 기재.' },
  { id: 'camp_contact', category: '여권 / 서류', name: '캠프 담당자 연락처 저장', required: true, tip: '인솔 교사 및 캠프 카카오톡 채널 미리 등록.' },

  // 2. 의류
  { id: 'clothing_short_t', category: '의류', name: '반팔 티셔츠', required: true, tip: '충분히 여유 있게 준비 (7~10벌 추천).' },
  { id: 'clothing_long_sleeve', category: '의류', name: '얇은 긴팔 옷', required: true, tip: '실내 에어컨 가동 시 추울 수 있으니 필수 (2~3벌).' },
  { id: 'clothing_shorts', category: '의류', name: '반바지', required: true, tip: '활동하기 편한 면 또는 운동용 반바지 (5~6벌).' },
  { id: 'clothing_pants', category: '의류', name: '긴바지', required: false, tip: '야외 액티비티나 저녁용 (1~2벌).' },
  { id: 'clothing_underwear', category: '의류', name: '속옷', required: true, tip: '세탁 서비스 주기를 고려해 7~10일분 이상.' },
  { id: 'clothing_socks', category: '의류', name: '양말', required: true, tip: '운동화 착용 시 필요 (7~10켤레).' },
  { id: 'clothing_pajamas', category: '의류', name: '잠옷', required: true, tip: '시원하고 편안한 취침용 의류 (3~4벌).' },
  { id: 'clothing_swimwear', category: '의류', name: '수영복', required: false, tip: '수영장 액티비티 및 호텔 물놀이 대비.' },
  { id: 'clothing_hat', category: '의류', name: '모자', required: false, tip: '강한 자외선 차단용 캡모자 또는 챙모자.' },
  { id: 'clothing_outerwear', category: '의류', name: '가벼운 겉옷', required: false, tip: '바람막이 또는 얇은 가디건.' },
  { id: 'clothing_sneakers', category: '의류', name: '운동화', required: false, tip: '발이 편한 운동용 운동화 (최소 1켤레).' },
  { id: 'clothing_sandals', category: '의류', name: '슬리퍼 / 샌들', required: false, tip: '숙소 내부 및 가벼운 외출 시 편리합니다.' },

  // 3. 세면 / 위생용품
  { id: 'hygiene_toothbrush', category: '세면 / 위생용품', name: '칫솔', required: true, tip: '여분을 포함하여 넉넉히 준비하세요.' },
  { id: 'hygiene_toothpaste', category: '세면 / 위생용품', name: '치약', required: true, tip: '개인 선호 제품으로 준비.' },
  { id: 'hygiene_shampoo', category: '세면 / 위생용품', name: '샴푸 / 바디워시', required: false, tip: '소형 용기나 일회용 파우치로 준비하면 편리합니다.' },
  { id: 'hygiene_towel', category: '세면 / 위생용품', name: '수건', required: false, tip: '숙소 세탁 서비스를 고려해 3~4장.' },
  { id: 'hygiene_sunblock', category: '세면 / 위생용품', name: '선크림', required: true, tip: 'SPF 50+ 야외 액티비티 필수품.' },
  { id: 'hygiene_comb', category: '세면 / 위생용품', name: '빗', required: false },
  { id: 'hygiene_cosmetics', category: '세면 / 위생용품', name: '개인 화장품', required: false, tip: '피부 진정 로션 및 크림 추천.' },
  { id: 'hygiene_nail_clippers', category: '세면 / 위생용품', name: '손톱깎이', required: false, tip: '한 달 캠프 기간 중 위생적인 손톱 관리를 위해 필요.' },
  { id: 'hygiene_cotton_swabs', category: '세면 / 위생용품', name: '면봉', required: false },
  { id: 'hygiene_sanitary', category: '세면 / 위생용품', name: '생리용품', required: false, tip: '필요 시 평소 쓰던 제품으로 여유 있게 준비.' },
  { id: 'hygiene_wet_wipes', category: '세면 / 위생용품', name: '물티슈', required: false, tip: '휴대하며 외부에서 쓰기 좋은 사이즈.' },
  { id: 'hygiene_tissues', category: '세면 / 위생용품', name: '휴대용 티슈', required: false },

  // 4. 학습용품
  { id: 'study_pencil_case', category: '학습용품', name: '필통', required: true },
  { id: 'study_writing', category: '학습용품', name: '연필 / 볼펜', required: true, tip: '충분한 필기구 (샤프, 여분 샤프심, 볼펜).' },
  { id: 'study_eraser', category: '학습용품', name: '지우개', required: false },
  { id: 'study_notebook', category: '학습용품', name: '노트', required: true, tip: '수업 노트 및 단어 기록 노트 (2~3권).' },
  { id: 'study_vocab', category: '학습용품', name: '영어 단어장', required: false, tip: '자율 학습 시간에 외울 단어장.' },
  { id: 'study_materials', category: '학습용품', name: '개인 학습자료', required: false, tip: '개인 공부 시간에 활용할 책이나 수학 문제집.' },
  { id: 'study_bag', category: '학습용품', name: '책가방 또는 보조가방', required: false, tip: '수업 이동이나 외출 시 필요한 가벼운 가방.' },

  // 5. 전자기기
  { id: 'elec_phone', category: '전자기기', name: '휴대폰', required: true, tip: '유심 사용 또는 로밍 상태를 확인하세요.' },
  { id: 'elec_charger', category: '전자기기', name: '휴대폰 충전기', required: true },
  { id: 'elec_powerbank', category: '전자기기', name: '보조배터리', required: false, tip: '★주의: 반드시 기내 수하물(들고 타는 가방)로 가져가야 합니다.' },
  { id: 'elec_adapter', category: '전자기기', name: '멀티어댑터', required: true, tip: '필리핀 플러그 규격(110V~220V 병용) 맞춤 멀티 플러그.' },
  { id: 'elec_earphones', category: '전자기기', name: '이어폰', required: false, tip: '어학 학습 및 기내 소음 차단용.' },
  { id: 'elec_tablet', category: '전자기기', name: '태블릿 또는 노트북', required: false, tip: '자습용 및 동영상 학습용.' },
  { id: 'elec_extra_cable', category: '전자기기', name: '충전 케이블 여분', required: false },

  // 6. 건강 / 비상약
  { id: 'med_personal', category: '건강 / 비상약', name: '개인 복용약', required: true, tip: '복용하는 상시 복용약은 반드시 한 달치 이상 충분히 챙겨주세요.' },
  { id: 'med_cold', category: '건강 / 비상약', name: '감기약', required: false, tip: '현지 에어컨 가동으로 냉방병 및 가벼운 감기 대비.' },
  { id: 'med_digestive', category: '건강 / 비상약', name: '소화제', required: false, tip: '낯선 음식 섭취 시 체함 방지.' },
  { id: 'med_motion_sickness', category: '건강 / 비상약', name: '멀미약', required: false, tip: '주말 액티비티 이동 거리가 길 수 있습니다.' },
  { id: 'med_band', category: '건강 / 비상약', name: '밴드', required: false, tip: '상처 보호용 밴드.' },
  { id: 'med_mosquito', category: '건강 / 비상약', name: '모기기피제', required: false, tip: '야외 활동 시 모기 및 해충 대비 (뿌리는 타입 등).' },
  { id: 'med_allergy', category: '건강 / 비상약', name: '알러지약', required: false, tip: '갑작스러운 알러지, 비염용 약.' },
  { id: 'med_fever', category: '건강 / 비상약', name: '해열제', required: false, tip: '타이레놀 등 성인/소아용 해열진통제.' },
  { id: 'med_ointment', category: '건강 / 비상약', name: '상처 연고', required: false, tip: '후시딘, 마데카솔 등 상처 연고 필수.' },
  { id: 'med_prescription', category: '건강 / 비상약', name: '처방약 복용 안내 메모', required: false, tip: '교사에게 전할 약 보관법 및 복용 시간 안내문.' },

  // 7. 용돈 / 기타
  { id: 'misc_peso', category: '용돈 / 기타', name: '필리핀 페소', required: false, tip: '현지 매점 및 액티비티 개인 간식용 (기본 환전 권장).' },
  { id: 'misc_krw', category: '용돈 / 기타', name: '한국돈 소액', required: false, tip: '국내 공항 왕복 이동 시 사용할 한화.' },
  { id: 'misc_crossbag', category: '용돈 / 기타', name: '작은 크로스백', required: false, tip: '외출 시 여권과 스마트폰을 안전하게 몸에 지닐 백.' },
  { id: 'misc_bottle', category: '용돈 / 기타', name: '물병', required: false, tip: '수업 및 활동 중 수분 섭취용 텀블러.' },
  { id: 'misc_ziploc', category: '용돈 / 기타', name: '비닐봉투 / 지퍼백', required: false, tip: '젖은 빨래, 여분 신발 보관용.' },
  { id: 'misc_umbrella', category: '용돈 / 기타', name: '우산 또는 우비', required: false, tip: '갑작스러운 스콜(소나기)을 대비한 가벼운 접이식 우산.' },
  { id: 'misc_mask', category: '용돈 / 기타', name: '여분 마스크', required: false },
  { id: 'misc_glasses', category: '용돈 / 기타', name: '안경 / 렌즈 용품', required: false, tip: '분실을 대비한 보조 안경 또는 렌즈 세척액.' },
  { id: 'misc_sunglasses', category: '용돈 / 기타', name: '선글라스', required: false, tip: '필리핀의 강한 태양빛으로부터 눈 보호.' },

  // 8. 가져오지 않아도 되는 것
  { id: 'prohibited_dryer', category: '가져오지 않아도 되는 것', name: '드라이기', required: false, isNegative: true, tip: '숙소에 비치되어 있으며 전압 차이로 현지 고장이 자주 발생합니다.' },
  { id: 'prohibited_expensive', category: '가져오지 않아도 되는 것', name: '과한 고가 물품', required: false, isNegative: true, tip: '고가 브랜드 제품, 값비싼 카메라 등은 도난/분실 시 보상이 어렵습니다.' },
  { id: 'prohibited_clothing', category: '가져오지 않아도 되는 것', name: '너무 많은 옷', required: false, isNegative: true, tip: '주 3회 세탁 서비스가 정기적으로 제공되므로 짐을 간소화하세요.' },
  { id: 'prohibited_weapons', category: '가져오지 않아도 되는 것', name: '위험한 물건', required: false, isNegative: true, tip: '칼, 가위, 불꽃놀이 등 위험 요지가 큰 품목 금지.' },
  { id: 'prohibited_jewelry', category: '가져오지 않아도 되는 것', name: '고가 액세서리', required: false, isNegative: true, tip: '체육 활동 및 야외 물놀이 중 쉽게 잃어버립니다.' },
  { id: 'prohibited_toys', category: '가져오지 않아도 되는 것', name: '큰 부피의 장난감', required: false, isNegative: true, tip: '수업 분위기를 저해하거나 짐 부피만 차지하는 큰 인형/보드게임 금지.' },
  { id: 'prohibited_loss_risk', category: '가져오지 않아도 되는 것', name: '분실 위험이 큰 물건', required: false, isNegative: true, tip: '파손되기 쉬운 애착 인형이나 고가 게임 기기.' }
];

// 2. Category Metadata with distinct colors and icons for high readability
const CATEGORY_META: Record<string, { icon: typeof FileText; color: string; border: string; bg: string; accentBg: string }> = {
  '출국 전 eTravel 등록': { icon: ExternalLink, color: 'text-sky-600', border: 'border-sky-100', bg: 'bg-sky-50', accentBg: 'bg-sky-500' },
  '여권 / 서류': { icon: FileText, color: 'text-blue-600', border: 'border-blue-100', bg: 'bg-blue-50', accentBg: 'bg-blue-500' },
  '의류': { icon: Briefcase, color: 'text-indigo-600', border: 'border-indigo-100', bg: 'bg-indigo-50', accentBg: 'bg-indigo-500' },
  '세면 / 위생용품': { icon: Sparkles, color: 'text-teal-600', border: 'border-teal-100', bg: 'bg-teal-50', accentBg: 'bg-teal-500' },
  '학습용품': { icon: Bookmark, color: 'text-amber-600', border: 'border-amber-100', bg: 'bg-amber-50', accentBg: 'bg-amber-500' },
  '전자기기': { icon: Smartphone, color: 'text-purple-600', border: 'border-purple-100', bg: 'bg-purple-50', accentBg: 'bg-purple-500' },
  '건강 / 비상약': { icon: Heart, color: 'text-rose-600', border: 'border-rose-100', bg: 'bg-rose-50', accentBg: 'bg-rose-500' },
  '용돈 / 기타': { icon: Wallet, color: 'text-emerald-600', border: 'border-emerald-100', bg: 'bg-emerald-50', accentBg: 'bg-emerald-500' },
  '가져오지 않아도 되는 것': { icon: AlertTriangle, color: 'text-red-600', border: 'border-red-100', bg: 'bg-red-50', accentBg: 'bg-red-500' }
};

const LOCAL_STORAGE_KEY = 'gitc-family-camp-checklist';

export default function App() {
  // --- States ---
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Keep track of collapsed states of categories
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>(() => {
    // Default: '가져오지 않아도 되는 것' is collapsed by default to focus on packing, others open
    return { '가져오지 않아도 되는 것': true };
  });

  // Search filter and tab filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'required' | 'remaining' | 'completed'>('all');

  // Custom visual toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAutoSaved, setShowAutoSaved] = useState(false);

  // Reset confirmation Modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // eTravel Guide Card collapsed state (starts expanded by default)
  const [isEtravelGuideExpanded, setIsEtravelGuideExpanded] = useState(true);

  // --- Side Effects ---
  // Save checks to localStorage on change and show subtle auto-save pill
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(checkedItems));
    
    // Quick blink of "Saved" badge
    setShowAutoSaved(true);
    const timer = setTimeout(() => setShowAutoSaved(false), 800);
    return () => clearTimeout(timer);
  }, [checkedItems]);

  // Toast message auto-dimmer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // --- Computations ---
  // Count of items
  const categoriesList = Object.keys(CATEGORY_META);

  // Filter items based on search and selected tab
  const filteredItems = useMemo(() => {
    return CHECKLIST_DATA.filter(item => {
      // 1. Search Query filter
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (item.tip && item.tip.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;

      // 2. Tab Filter
      const isChecked = !!checkedItems[item.id];
      if (filterTab === 'required') {
        return item.required;
      }
      if (filterTab === 'remaining') {
        return !isChecked;
      }
      if (filterTab === 'completed') {
        return isChecked;
      }
      return true;
    });
  }, [searchQuery, filterTab, checkedItems]);

  // Dynamic statistics calculations
  const stats = useMemo(() => {
    const activeItems = CHECKLIST_DATA.filter(i => !i.isNegative);
    const negativeItems = CHECKLIST_DATA.filter(i => i.isNegative);
    
    const totalActive = activeItems.length;
    const completedActive = activeItems.filter(i => !!checkedItems[i.id]).length;
    
    const totalRequired = activeItems.filter(i => i.required).length;
    const completedRequired = activeItems.filter(i => i.required && !!checkedItems[i.id]).length;

    const totalNegative = negativeItems.length;
    const completedNegative = negativeItems.filter(i => !!checkedItems[i.id]).length;

    const totalAll = CHECKLIST_DATA.length;
    const completedAll = CHECKLIST_DATA.filter(i => !!checkedItems[i.id]).length;

    const progressPercentage = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0;

    return {
      totalAll,
      completedAll,
      totalActive,
      completedActive,
      totalRequired,
      completedRequired,
      totalNegative,
      completedNegative,
      progressPercentage
    };
  }, [checkedItems]);

  // Completion count by category
  const categoryStats = useMemo(() => {
    const counts: Record<string, { total: number; completed: number }> = {};
    
    categoriesList.forEach(cat => {
      const itemsInCat = CHECKLIST_DATA.filter(i => i.category === cat);
      const completedInCat = itemsInCat.filter(i => !!checkedItems[i.id]).length;
      counts[cat] = {
        total: itemsInCat.length,
        completed: completedInCat
      };
    });
    
    return counts;
  }, [checkedItems, categoriesList]);

  // --- Handlers ---
  const handleToggleItem = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleToggleCategory = (catName: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  const handleExpandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    categoriesList.forEach(cat => {
      allExpanded[cat] = false; // false means not collapsed -> expanded!
    });
    setCollapsedCategories(allExpanded);
    showToast('모든 카테고리를 펼쳤습니다.');
  };

  const handleCollapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    categoriesList.forEach(cat => {
      allCollapsed[cat] = true; // true means collapsed
    });
    setCollapsedCategories(allCollapsed);
    showToast('모든 카테고리를 접었습니다.');
  };

  const handleResetChecklist = () => {
    setCheckedItems({});
    setIsResetModalOpen(false);
    showToast('준비물 체크리스트가 초기화되었습니다.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleShareProgress = () => {
    const textReport = `[GITC 가족캠프 출국 준비 현황 ✈️]
━━━━━━━━━━━━━━━━━━━━
📌 전체 진행률: ${stats.progressPercentage}% (${stats.completedAll}/${stats.totalAll} 완료)

✅ 필수 준비물: ${stats.completedRequired}/${stats.totalRequired}개 완료
✨ 일반 준비물: ${stats.completedActive - stats.completedRequired}/${stats.totalActive - stats.totalRequired}개 완료
🚫 반입제외 확인: ${stats.completedNegative}/${stats.totalNegative}개 체크완료

■ 상세 현황:
${categoriesList.map(cat => {
  const cStat = categoryStats[cat];
  const marker = cStat.completed === cStat.total ? '✅' : '⏳';
  return `${marker} ${cat}: ${cStat.completed}/${cStat.total}`;
}).join('\n')}

💡 출국 전까지 하나씩 꼭 체크해 주세요!
━━━━━━━━━━━━━━━━━━━━`;

    navigator.clipboard.writeText(textReport)
      .then(() => {
        showToast('📋 현황이 클립보드에 복사되었습니다! 카톡 등에 붙여넣기 해보세요.');
      })
      .catch(() => {
        showToast('복사에 실패했습니다. 내용을 직접 적어주세요.');
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative" id="app_root">
      {/* 1. Header Banner */}
      <header className="bg-slate-900 text-white pt-8 pb-12 px-6 rounded-b-[2.5rem] shadow-lg relative overflow-hidden" id="main_header">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-10 -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full filter blur-3xl opacity-10 -ml-16 -mb-16 pointer-events-none"></div>

        <div className="max-w-lg mx-auto relative">
          <div className="flex items-center justify-between mb-4">
            <span className="bg-blue-600/30 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full border border-blue-500/20 tracking-wider">
              GITC FAMILY CAMP
            </span>
            
            {/* Auto save status indicator */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className={`w-2 h-2 rounded-full ${showAutoSaved ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`}></span>
              <span>실시간 자동저장</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2">
            GITC 가족캠프 준비물 체크리스트
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light">
            출국 전 학부모님께서 하나씩 꼼꼼하게 체크해 주세요. 🎒✈️
          </p>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 -mt-6 pb-20 relative" id="main_content">
        {/* 2. Top Banner (Required by user request) */}
        <div className="bg-orange-50 border-2 border-orange-200/80 rounded-2xl p-4 mb-6 shadow-sm flex items-start gap-3.5" id="top_announcement">
          <div className="p-2 bg-orange-100 rounded-xl text-orange-600 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-orange-950 mb-0.5">중요 안내 (필독)</h4>
            <p className="text-xs md:text-sm text-orange-900 leading-relaxed font-medium">
              가족캠프 참가자는 가족관계 확인을 위해 <span className="underline decoration-2 decoration-orange-500 font-extrabold">영문 주민등록등본</span>을 반드시 준비해 주세요.
            </p>
          </div>
        </div>

        {/* 3. Progress Sticky Card */}
        <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md mb-6 sticky top-2 z-30" id="progress_dashboard">
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              전체 준비 현황
            </h3>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              총 {stats.totalAll}개 중 <span className="text-blue-600 font-bold">{stats.completedAll}</span>개 체크완료
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4 relative">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.progressPercentage}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>

          {/* Statistics Breakdown Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50/50 rounded-xl p-2.5 border border-blue-100/50">
              <span className="text-[10px] text-blue-800 font-medium block mb-0.5">필수 품목</span>
              <span className="text-sm font-extrabold text-blue-900 block font-mono">
                {stats.completedRequired}/{stats.totalRequired}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                ({stats.totalRequired > 0 ? Math.round((stats.completedRequired / stats.totalRequired) * 100) : 0}%)
              </span>
            </div>
            
            <div className="bg-indigo-50/50 rounded-xl p-2.5 border border-indigo-100/50">
              <span className="text-[10px] text-indigo-800 font-medium block mb-0.5">일반 준비물</span>
              <span className="text-sm font-extrabold text-indigo-900 block font-mono">
                {stats.completedActive - stats.completedRequired}/{stats.totalActive - stats.totalRequired}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">선택사항</span>
            </div>

            <div className="bg-red-50/50 rounded-xl p-2.5 border border-red-100/50">
              <span className="text-[10px] text-red-800 font-medium block mb-0.5">반입 제외품</span>
              <span className="text-sm font-extrabold text-red-900 block font-mono">
                {stats.completedNegative}/{stats.totalNegative}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">두고 가기 확인</span>
            </div>
          </div>

          {/* Share & Copy button */}
          <button 
            onClick={handleShareProgress}
            className="w-full mt-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            카카오톡/문자로 현황 공유하기
          </button>
        </section>

        {/* 4. Filter & Search Toolbar */}
        <section className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm mb-6" id="search_filter_bar">
          <div className="relative mb-3.5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text"
              placeholder="찾으시는 준비물을 입력해 보세요 (예: 선크림)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-2xl py-3 pl-10 pr-4 text-sm font-medium outline-none transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
              <button 
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                전체
              </button>
              <button 
                onClick={() => setFilterTab('required')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterTab === 'required' ? 'bg-red-500 text-white shadow-xs' : 'text-slate-500 hover:text-red-500'}`}
              >
                필수만
              </button>
              <button 
                onClick={() => setFilterTab('remaining')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterTab === 'remaining' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-blue-600'}`}
              >
                미완료
              </button>
              <button 
                onClick={() => setFilterTab('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterTab === 'completed' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-emerald-600'}`}
              >
                완료됨
              </button>
            </div>

            {/* Expand / Collapse Control */}
            <div className="flex gap-2">
              <button 
                onClick={handleExpandAll}
                className="text-[11px] text-slate-500 hover:text-slate-800 bg-slate-100 active:bg-slate-200 px-2 py-1.5 rounded-lg font-semibold transition"
              >
                전체 펼치기
              </button>
              <button 
                onClick={handleCollapseAll}
                className="text-[11px] text-slate-500 hover:text-slate-800 bg-slate-100 active:bg-slate-200 px-2 py-1.5 rounded-lg font-semibold transition"
              >
                전체 접기
              </button>
            </div>
          </div>
        </section>

        {/* 필리핀 eTravel 등록 안내 섹션 */}
        <section className="bg-sky-50 border border-sky-200/70 rounded-3xl p-5 mb-6 shadow-xs relative overflow-hidden" id="etravel_guide_section">
          {/* Subtle background plane watermark or decorative bubble */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-200/30 rounded-full filter blur-xl -mr-6 -mt-6 pointer-events-none"></div>

          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-extrabold text-sky-950 flex items-center gap-2">
              <span className="p-1.5 bg-sky-500 text-white rounded-xl">
                <ExternalLink className="w-4 h-4" />
              </span>
              필리핀 eTravel 등록 안내
            </h3>
            <button
              onClick={() => setIsEtravelGuideExpanded(!isEtravelGuideExpanded)}
              className="text-xs font-bold text-sky-700 hover:text-sky-900 bg-sky-100/80 active:bg-sky-200 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1"
            >
              {isEtravelGuideExpanded ? (
                <>안내 접기 <ChevronUp className="w-3.5 h-3.5" /></>
              ) : (
                <>안내 펼치기 <ChevronDown className="w-3.5 h-3.5" /></>
              )}
            </button>
          </div>

          <h4 className="text-sm font-extrabold text-sky-900 mb-2">
            “필리핀 입국 전 eTravel 등록 및 QR코드 발급이 필요합니다.”
          </h4>

          <AnimatePresence initial={false}>
            {isEtravelGuideExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 text-xs md:text-sm text-sky-950 leading-relaxed overflow-hidden"
              >
                <p className="text-sky-900 leading-relaxed bg-white/60 p-3 rounded-2xl border border-sky-100/50">
                  eTravel은 필리핀 입국 전 등록해야 하는 온라인 입국 신고 시스템입니다. 비행기 출발시간 기준 <strong>72시간 전</strong>부터 등록해 주세요.
                </p>

                {/* ⭐️ 학부모와 아이 각각 등록 강조 */}
                <div className="bg-amber-50 border border-amber-200/70 rounded-2xl p-3.5 flex gap-2.5 shadow-xs">
                  <div className="text-amber-600 shrink-0 mt-0.5 font-bold">⚠️</div>
                  <div>
                    <strong className="text-amber-950 font-bold block mb-0.5">학부모와 자녀 각각 개별 등록 필수!</strong>
                    <p className="text-amber-900 font-medium leading-relaxed">
                      가족캠프는 학부모님과 자녀가 <span className="underline decoration-2 decoration-amber-500 font-extrabold text-amber-950">각각 따로 등록</span>해야 하며, 등록 완료 후 발급되는 QR코드도 <span className="font-extrabold text-amber-950">각각 개별적으로 저장</span>해야 합니다. (예: 학부모 1명 + 아이 1명 = 총 2개의 QR코드 필요)
                    </p>
                  </div>
                </div>

                {/* 🚨 무료 / 공식 사이트 / 유료 대행 주의 */}
                <div className="bg-rose-50 border border-rose-200/60 rounded-2xl p-3.5 flex gap-2.5 shadow-xs">
                  <div className="text-rose-600 shrink-0 mt-0.5 text-base">🚨</div>
                  <div>
                    <strong className="text-rose-950 font-extrabold block mb-1">100% 무료 등록 (유료 대행 사이트 절대 주의)</strong>
                    <p className="text-rose-900 leading-relaxed font-medium mb-2">
                      eTravel 등록은 공식적으로 <strong>전액 무료</strong>입니다. 결제를 유도하는 모방/대행 사기 사이트가 많으니 반드시 아래 공식 주소에서만 진행해 주세요.
                    </p>
                    <a 
                      href="https://etravel.gov.ph" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-rose-600 text-white font-bold py-1.5 px-3 rounded-lg text-[11px] hover:bg-rose-700 active:bg-rose-800 transition"
                    >
                      eTravel 공식 사이트 바로가기 <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* 등록 전 준비할 정보 & 등록 방법 2단 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* 준비 정보 */}
                  <div className="bg-white/80 rounded-2xl p-4 border border-sky-100">
                    <h5 className="font-extrabold text-sky-950 mb-2.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-sky-500 rounded-xs"></span>
                      등록 전 준비할 정보
                    </h5>
                    <ol className="space-y-1.5 text-sky-900 font-medium list-decimal list-inside pl-0.5">
                      <li>여권 정보 (여권번호, 만료일 등)</li>
                      <li>항공편명 (예: PR467 등)</li>
                      <li>필리핀 도착일</li>
                      <li>필리핀 체류 주소 (GITC 리조트/어학원)</li>
                      <li>이메일 주소</li>
                      <li>연락 가능한 휴대폰 번호</li>
                    </ol>
                  </div>

                  {/* 등록 방법 */}
                  <div className="bg-white/80 rounded-2xl p-4 border border-sky-100">
                    <h5 className="font-extrabold text-sky-950 mb-2.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-sky-500 rounded-xs"></span>
                      등록 방법 및 순서
                    </h5>
                    <ul className="space-y-2 text-sky-900 leading-normal font-medium text-[11px]">
                      <li className="flex items-start gap-1"><span className="text-sky-500 font-bold shrink-0">1.</span> <span>eTravel 공식 사이트에 접속합니다.</span></li>
                      <li className="flex items-start gap-1"><span className="text-sky-500 font-bold shrink-0">2.</span> <span>계정을 만들거나 로그인합니다.</span></li>
                      <li className="flex items-start gap-1"><span className="text-sky-500 font-bold shrink-0">3.</span> <span>입국자 정보 및 여권 정보를 입력합니다.</span></li>
                      <li className="flex items-start gap-1"><span className="text-sky-500 font-bold shrink-0">4.</span> <span>항공편 정보 및 도착일자를 정확히 입력합니다.</span></li>
                      <li className="flex items-start gap-1"><span className="text-sky-500 font-bold shrink-0">5.</span> <span>필리핀 체류 주소 정보를 입력합니다.</span></li>
                      <li className="flex items-start gap-1"><span className="text-sky-500 font-bold shrink-0">6.</span> <span>건강 관련 질문에 신중히 답변합니다.</span></li>
                      <li className="flex items-start gap-1"><span className="text-sky-500 font-bold shrink-0">7.</span> <span>등록 완료 후 화면에 나오는 QR코드를 캡처 또는 다운로드합니다.</span></li>
                      <li className="flex items-start gap-1"><span className="text-sky-500 font-bold shrink-0">8.</span> <span>학부모와 아이 각각의 QR코드가 발급되었는지 최종 확인합니다.</span></li>
                    </ul>
                  </div>
                </div>

                {/* Additional Important Info List */}
                <div className="bg-sky-100/50 rounded-2xl p-4.5 text-[11px] text-sky-950 leading-relaxed border border-sky-100">
                  <h5 className="font-extrabold mb-1.5 text-sky-950">📌 알아두면 좋은 탑승 팁</h5>
                  <ul className="space-y-1.5 list-disc list-inside text-sky-900 font-medium">
                    <li>발급 완료된 QR코드는 공항 카운터 체크인 시 또는 탑승 전에 항공사 직원들이 수시로 확인하므로 <span className="font-bold text-sky-950">휴대폰 사진첩에 꼭 저장</span>해 두셔야 신속합니다.</li>
                    <li>가끔 인터넷 접속이 불안정한 필리핀 공항 사정을 고려해, <span className="font-bold text-sky-950">QR코드 출력본(종이)</span>을 여권 사이에 끼워 보관하면 훨씬 더 안심하고 통과할 수 있습니다.</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 5. Checklist Categories */}
        <section className="space-y-4" id="categories_section">
          {categoriesList.map((category) => {
            const isProhibited = category === '가져오지 않아도 되는 것';
            const meta = CATEGORY_META[category];
            const items = CHECKLIST_DATA.filter(item => item.category === category);
            
            // Filter items under this category based on search & tab filter
            const visibleItems = filteredItems.filter(item => item.category === category);
            
            const isCollapsed = collapsedCategories[category];
            const catStats = categoryStats[category];
            const isCategoryCompleted = catStats.completed === catStats.total;

            // If there is a search filter or tab filter, auto-force expand the category if there are items inside
            const displayCollapsed = (searchQuery !== '' || filterTab !== 'all') ? false : isCollapsed;

            // If there is a search/filter active and this category has no matching items, hide the category header too
            if (visibleItems.length === 0 && (searchQuery !== '' || filterTab !== 'all')) {
              return null;
            }

            const CatIcon = meta.icon;

            return (
              <article 
                key={category} 
                className={`bg-white rounded-3xl border transition duration-200 shadow-xs overflow-hidden ${
                  isProhibited 
                    ? 'border-red-100 focus-within:border-red-300' 
                    : isCategoryCompleted 
                      ? 'border-emerald-200/60 bg-emerald-50/5 focus-within:border-emerald-300' 
                      : 'border-slate-200/80 focus-within:border-blue-300'
                }`}
              >
                {/* Category Header Bar */}
                <button
                  onClick={() => handleToggleCategory(category)}
                  className={`w-full flex items-center justify-between p-4.5 text-left transition select-none ${
                    isProhibited 
                      ? 'hover:bg-red-50/30' 
                      : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${meta.bg} ${meta.color} shrink-0 shadow-xs`}>
                      <CatIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                        {category}
                        {isCategoryCompleted && !isProhibited && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            완료
                          </span>
                        )}
                        {isProhibited && (
                          <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            반입불가
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {isProhibited ? '확인 완료' : '준비 완료'}: <span className={isCategoryCompleted ? "text-emerald-600 font-bold" : "font-semibold text-slate-700"}>{catStats.completed}</span> / {catStats.total}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Category simple progress ring bar representation */}
                    <div className="w-10 h-1.5 bg-slate-100 rounded-full overflow-hidden mr-1">
                      <div 
                        className={`h-full rounded-full ${isProhibited ? 'bg-red-500' : isCategoryCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${(catStats.completed / catStats.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                      {displayCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    </div>
                  </div>
                </button>

                {/* Checklist Items Container */}
                <AnimatePresence initial={false}>
                  {!displayCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-100 divide-y divide-slate-100/70"
                    >
                      <div className="p-2.5 space-y-1.5 bg-slate-50/30">
                        {visibleItems.map((item) => {
                          const isChecked = !!checkedItems[item.id];
                          return (
                            <label
                              key={item.id}
                              className={`flex items-start gap-3.5 p-3.5 rounded-2xl cursor-pointer transition select-none relative group ${
                                isChecked
                                  ? isProhibited
                                    ? 'bg-red-50/40 border border-red-100/50'
                                    : 'bg-emerald-50/30 border border-emerald-100/30'
                                  : 'bg-white hover:bg-slate-50 border border-slate-100 shadow-xs'
                              }`}
                            >
                              {/* Hidden Checkbox */}
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleItem(item.id)}
                                className="sr-only"
                              />

                              {/* Custom satisfying Checkbox Indicator */}
                              <div className="pt-0.5 shrink-0">
                                <div
                                  className={`w-6.5 h-6.5 rounded-lg border-2 flex items-center justify-center transition-all ${
                                    isChecked
                                      ? isProhibited
                                        ? 'bg-red-500 border-red-500 scale-102 shadow-xs'
                                        : 'bg-blue-600 border-blue-600 scale-102 shadow-xs'
                                      : 'bg-white border-slate-300 group-hover:border-slate-400'
                                  }`}
                                >
                                  {isChecked && (
                                    isProhibited ? (
                                      <X className="w-4.5 h-4.5 text-white stroke-[3.5]" />
                                    ) : (
                                      <Check className="w-4.5 h-4.5 text-white stroke-[3.5]" />
                                    )
                                  )}
                                </div>
                              </div>

                              {/* Item Text & Helpful Tips */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-1.5">
                                  <span
                                    className={`text-base font-bold transition duration-150 break-all leading-snug ${
                                      isChecked
                                        ? 'text-slate-400 line-through'
                                        : 'text-slate-800'
                                    }`}
                                  >
                                    {item.name}
                                  </span>

                                  {/* Badges */}
                                  {item.required && (
                                    <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md tracking-tight shrink-0">
                                      필수
                                    </span>
                                  )}
                                  
                                  {isProhibited && (
                                    <span className="bg-orange-100 text-orange-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md tracking-tight shrink-0">
                                      가져오지 않기
                                    </span>
                                  )}
                                </div>

                                {item.tip && (
                                  <p
                                    className={`text-xs mt-1 leading-relaxed break-keep font-normal transition duration-150 ${
                                      isChecked ? 'text-slate-400/80' : 'text-slate-500'
                                    }`}
                                  >
                                    {item.tip}
                                  </p>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            );
          })}
        </section>

        {/* Search empty state */}
        {filteredItems.length === 0 && (
          <div className="bg-white rounded-3xl p-10 border border-slate-100 text-center shadow-xs" id="empty_search_state">
            <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-800 font-bold mb-1">검색 결과가 없습니다.</p>
            <p className="text-xs text-slate-500">다른 키워드를 써보시거나 필터를 변경해 보세요.</p>
            <button 
              onClick={() => { setSearchQuery(''); setFilterTab('all'); }}
              className="mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl text-xs transition"
            >
              필터 및 검색 초기화
            </button>
          </div>
        )}

        {/* 6. Footer Information Card */}
        <section className="bg-slate-900 text-slate-100 rounded-3xl p-6 mt-10 shadow-md relative overflow-hidden" id="footer_card">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-full filter blur-xl opacity-30 -mr-10 -mt-10 pointer-events-none"></div>
          
          <h4 className="text-sm font-bold text-slate-300 flex items-center gap-1.5 mb-3">
            <Info className="w-4.5 h-4.5 text-blue-400" />
            안내 및 도움말
          </h4>
          
          <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed font-light mb-5">
            <li className="flex items-start gap-1.5">
              <span className="text-blue-400 select-none">•</span>
              <span>체크한 상태는 브라우저({LOCAL_STORAGE_KEY})에 자동으로 즉시 저장되므로, 인터넷 브라우저 앱을 닫고 나중에 다시 열어도 유지됩니다.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-blue-400 select-none">•</span>
              <span><strong className="text-white font-bold">"필수"</strong> 뱃지가 있는 서류와 의류는 수속 및 현지 정착을 위해 꼭 필요한 것들입니다. 빠짐없이 챙겨주세요.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-blue-400 select-none">•</span>
              <span>개인 상황에 따라 추가 준비물이 필요할 수 있습니다. 궁금한 점은 캠프 담당자에게 문의해 주세요.</span>
            </li>
          </ul>

          <div className="border-t border-slate-800 pt-4.5">
            <h5 className="text-xs font-bold text-slate-300 mb-2.5">📞 GITC 캠프 운영진 연락처</h5>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <a href="tel:010-5394-7324" className="bg-slate-800 p-2.5 rounded-xl border border-slate-700/50 block hover:bg-slate-700 transition">
                <span className="text-slate-400 block mb-0.5">캠프 총괄 정선영 선생님</span>
                <span className="text-white font-bold block">010-5394-7324</span>
              </a>
              <a href="https://open.kakao.com/o/sPhkO0ji" target="_blank" rel="noopener noreferrer" className="bg-[#FEE500] p-2.5 rounded-xl border border-[#E6CD00] block hover:bg-[#F3DC00] transition shadow-xs">
                <span className="text-[#3c3a12] block mb-0.5 font-semibold">카카오톡 오픈채팅</span>
                <span className="text-[#191919] font-extrabold block">터치하여 바로 연결 💬</span>
              </a>
            </div>
          </div>
        </section>

        {/* 7. Reset Checklist Button */}
        <section className="text-center mt-8 px-4" id="reset_section">
          <p className="text-xs text-slate-400 mb-2.5">
            준비물을 처음부터 다시 체크하고 싶으신가요?
          </p>
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 py-2 px-4 rounded-xl border border-red-200/50 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            전체 체크 상태 초기화
          </button>
        </section>
      </main>

      {/* Footer Branding */}
      <footer className="py-6 text-center border-t border-slate-200 bg-white mt-auto text-slate-400 text-[11px]" id="page_footer">
        <p>© GITC Family Camp Checklist. All rights reserved.</p>
        <p className="mt-1 font-mono text-[10px]">v1.2.0 • Local Storage Persistence</p>
      </footer>

      {/* --- In-App Custom Overlay Toast Notification --- */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-4 right-4 z-50 pointer-events-none"
          >
            <div className="bg-slate-900 text-white text-xs md:text-sm font-bold px-4 py-3.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 max-w-md mx-auto pointer-events-auto border border-slate-800">
              <span className="flex-1">{toastMessage}</span>
              <button 
                onClick={() => setToastMessage(null)}
                className="text-slate-400 hover:text-white p-0.5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- In-App Beautiful Custom Confirmation Modal --- */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResetModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            ></motion.div>

            {/* Modal Dialog Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full relative z-10 border border-slate-100"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4">
                <RotateCcw className="w-6 h-6 animate-spin-reverse" />
              </div>
              
              <h4 className="text-lg font-extrabold text-slate-900 mb-2">
                체크리스트를 초기화할까요?
              </h4>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed mb-6 break-keep">
                현재까지 체크하신 모든 항목들의 준비 상태가 지워지고 처음 상태로 돌아갑니다. 이 작업은 되돌릴 수 없습니다.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl text-xs transition outline-none"
                >
                  취소하기
                </button>
                <button
                  onClick={handleResetChecklist}
                  className="flex-1 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md outline-none"
                >
                  초기화 실행
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
