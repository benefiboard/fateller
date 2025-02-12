import {
  Sparkles,
  Coins,
  RefreshCw,
  Lightbulb,
  Users,
  UserCheck,
  ShoppingBag,
  Cloud,
  Heart,
  Gift,
  Undo2,
  UserMinus,
  ThermometerSun,
  Briefcase,
  Calendar,
  TrendingUp,
  MessageCircle,
  Rocket,
  Clock,
  BadgeDollarSign,
  Wine,
  Trophy,
  Utensils,
  Building2,
  UtensilsCrossed,
  CreditCard,
  Dumbbell,
  Scale,
  MapPin,
  PiggyBank,
  Palette,
  Home,
  Youtube,
  Plane,
  TreePalm,
} from 'lucide-react';

export const categories = [
  {
    name: '일상운세',
    id: 'daily',
  },
  {
    name: '인연탐구',
    id: 'relationship',
  },
  {
    name: '커리어고민',
    id: 'career',
  },
  {
    name: '일상질문',
    id: 'life',
  },
  {
    name: '미래예측',
    id: 'future',
  },
];

export const linkOptions = [
  // 일상운세 (8개)
  {
    category: 'daily',
    href: '/mirror/daily/mood',
    icon: Sparkles,
    mainText: '오늘 갑자기 기분이 좋은데\n뭔가 좋은 일이 생길까?',
    subText: '#행운 #기대감',
  },
  {
    category: 'daily',
    href: '/mirror/daily/money',
    icon: Coins,
    mainText: '이번주 금전운은 어떨까?',
    subText: '#횡재 #금전운',
  },
  {
    category: 'daily',
    href: '/mirror/daily/when',
    icon: Lightbulb,
    mainText: '고민했던 일, 언제할까?',
    subText: '#선택 #타이밍',
  },
  {
    category: 'daily',
    href: '/mirror/daily/reverse',
    icon: RefreshCw,
    mainText: '오늘 망친 것 같은데 역전될까?',
    subText: '#반전 #기회',
  },
  {
    category: 'daily',
    href: '/mirror/daily/meet',
    icon: Users,
    mainText: '오늘 그 사람을 우연히 만날까?',
    subText: '#인연 #우연',
  },
  {
    category: 'daily',
    href: '/mirror/daily/interview',
    icon: UserCheck,
    mainText: '면접 보러 가는 길, 합격일까?',
    subText: '#성공운 #기회',
  },
  {
    category: 'daily',
    href: '/mirror/daily/shopping',
    icon: ShoppingBag,
    mainText: '지른 옷,\n환불해야 하나 말아야 하나?',
    subText: '#결정 #선택',
  },
  {
    category: 'daily',
    href: '/mirror/daily/weekend',
    icon: Cloud,
    mainText: '주말을 계획대로 보낼 수 있을까?',
    subText: '#주말운 #계획',
  },

  // 인연탐구 (8개)
  {
    category: 'relationship',
    href: '/mirror/relationship/crush',
    icon: Heart,
    mainText: '짝사랑하는 그 사람도\n나를 좋아할까?',
    subText: '#짝사랑 #설렘',
  },
  {
    category: 'relationship',
    href: '/mirror/relationship/date',
    icon: Gift,
    mainText: '이 소개팅, 잘 될까?',
    subText: '#소개팅 #인연',
  },
  {
    category: 'relationship',
    href: '/mirror/relationship/ex',
    icon: Undo2,
    mainText: '전 애인이랑\n다시 만나면 달라질까?',
    subText: '#재회 #변화',
  },
  {
    category: 'relationship',
    href: '/mirror/relationship/friend',
    icon: UserMinus,
    mainText: '이 친구와 절교하게 될까?',
    subText: '#우정 #갈등',
  },
  {
    category: 'relationship',
    href: '/mirror/relationship/some',
    icon: ThermometerSun,
    mainText: '썸만 타다 끝날까 진전이 있을까?',
    subText: '#썸 #발전',
  },
  {
    category: 'relationship',
    href: '/mirror/relationship/coworker',
    icon: Briefcase,
    mainText: '직장 동료와 친해져도 될까?',
    subText: '#인연 #경계',
  },
  {
    category: 'relationship',
    href: '/mirror/relationship/timing',
    icon: Calendar,
    mainText: '소개팅 날짜, 오늘로 잡을까?',
    subText: '#데이트 #타이밍',
  },
  {
    category: 'relationship',
    href: '/mirror/relationship/future',
    icon: TrendingUp,
    mainText: '이 관계, 발전할 수 있을까?',
    subText: '#관계 #가능성',
  },

  // 커리어고민 (8개)
  {
    category: 'career',
    href: '/mirror/career/change',
    icon: Briefcase,
    mainText: '이직하면 연봉 오를까?',
    subText: '#연봉 #이직',
  },
  {
    category: 'career',
    href: '/mirror/career/careercoworker',
    icon: MessageCircle,
    mainText: '동료와 의견충돌,\n내가 먼저 사과할까?',
    subText: '#직장생활 #처세',
  },
  {
    category: 'career',
    href: '/mirror/career/challenge',
    icon: Rocket,
    mainText: '퇴사하고 새로운 도전해볼까?',
    subText: '#도전 #변화',
  },
  {
    category: 'career',
    href: '/mirror/career/late',
    icon: Clock,
    mainText: '오늘 지각할 것 같은데 무사할까?',
    subText: '#위기 #순간',
  },
  {
    category: 'career',
    href: '/mirror/career/vacation',
    icon: TreePalm,
    mainText: '연차 써도 될까 말까?',
    subText: '#휴가 #선택',
  },
  {
    category: 'career',
    href: '/mirror/career/bonus',
    icon: BadgeDollarSign,
    mainText: '이번 분기 성과급 기대해도 될까?',
    subText: '#성과 #보상',
  },
  {
    category: 'career',
    href: '/mirror/career/dinner',
    icon: Wine,
    mainText: '팀 회식, 참석해야 할까?',
    subText: '#인간관계 #처세',
  },
  {
    category: 'career',
    href: '/mirror/career/promotion',
    icon: Trophy,
    mainText: '진급 기회가 올까?',
    subText: '#성장 #기회',
  },

  // 일상질문 (8개)
  {
    category: 'life',
    href: '/mirror/life/lunch',
    icon: Utensils,
    mainText: '오늘 점심은 어떨까?',
    subText: '#점심 #선택',
  },
  {
    category: 'life',
    href: '/mirror/life/lifeweekend',
    icon: Calendar,
    mainText: '이번 주말에 뭐하지?',
    subText: '#주말 #계획',
  },
  {
    category: 'life',
    href: '/mirror/life/overtime',
    icon: Building2,
    mainText: '오늘 야근할 것 같은데\n피할 수 있을까?',
    subText: '#퇴근 #행운',
  },
  {
    category: 'life',
    href: '/mirror/life/lifedinner',
    icon: UtensilsCrossed,
    mainText: '배달 시켜먹을까 나가서 먹을까?',
    subText: '#저녁 #선택',
  },
  {
    category: 'life',
    href: '/mirror/life/card',
    icon: CreditCard,
    mainText: '이번달 카드값 감당될까?',
    subText: '#지출 #걱정',
  },
  {
    category: 'life',
    href: '/mirror/life/exercise',
    icon: Dumbbell,
    mainText: '오늘 운동 가기 귀찮은데\n갈까? 말까?',
    subText: '#운동 #의지',
  },
  {
    category: 'life',
    href: '/mirror/life/diet',
    icon: Scale,
    mainText: '다이어트 오늘부터 시작할까?',
    subText: '#결심 #시작',
  },
  {
    category: 'life',
    href: '/mirror/life/travel',
    icon: MapPin,
    mainText: '주말에 어디가지?',
    subText: '#여행 #계획',
  },

  // 미래예측 (8개)
  {
    category: 'future',
    href: '/mirror/future/lottery',
    icon: Coins,
    mainText: '복권 사면 당첨될까?',
    subText: '#행운 #금전',
  },
  {
    category: 'future',
    href: '/mirror/future/love',
    icon: Heart,
    mainText: '다음 연애는 언제쯤 시작될까?',
    subText: '#연애운 #기다림',
  },
  {
    category: 'future',
    href: '/mirror/future/savings',
    icon: PiggyBank,
    mainText: '이번달 저축 목표\n달성할 수 있을까?',
    subText: '#저축 #목표',
  },
  {
    category: 'future',
    href: '/mirror/future/hobby',
    icon: Palette,
    mainText: '새로운 취미 배워볼까?',
    subText: '#도전 #변화',
  },
  {
    category: 'future',
    href: '/mirror/future/moving',
    icon: Home,
    mainText: '이사갈 때가 된걸까?',
    subText: '#변화 #결정',
  },
  {
    category: 'future',
    href: '/mirror/future/youtube',
    icon: Youtube,
    mainText: '유튜브 시작해볼까?',
    subText: '#도전 #시작',
  },
  {
    category: 'future',
    href: '/mirror/future/investment',
    icon: TrendingUp,
    mainText: '재테크 시작해볼까?',
    subText: '#투자 #미래',
  },
  {
    category: 'future',
    href: '/mirror/future/futurevacation',
    icon: Plane,
    mainText: '이번 휴가 해외여행 갈까?',
    subText: '#여행 #계획',
  },
];
