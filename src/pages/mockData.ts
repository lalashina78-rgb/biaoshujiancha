import { ScoringResult, CreditCheckItem } from '../types';

// Mock Scoring Data for Technical Check
export const MOCK_SCORING_RESULT: ScoringResult = {
  totalScore: 85.5,
  maxTotalScore: 100,
  riskLevel: 'medium',
  riskMessage: '技术标的响应不完整，部分响应点匹配度较低，建议查看差异原因。',
  categories: [
    { category: '施工组织', score: 22, maxScore: 25 },
    { category: '施工进度', score: 18, maxScore: 20 },
    { category: '安全文明', score: 14, maxScore: 15 },
    { category: '质量保证', score: 12, maxScore: 15 },
    { category: '项目管理', score: 11, maxScore: 15 },
    { category: '资源配置', score: 8.5, maxScore: 10 },
  ],
  points: [
    { id: '1', name: '施工组织总体方案完整性', category: '施工组织', score: 6, maxScore: 10, riskLevel: 'medium', deductionSummary: '资源配置说明不完整，缺少关键机械设备进场计划。' },
    { id: '2', name: '施工进度计划合理性', category: '施工进度', score: 4, maxScore: 10, riskLevel: 'medium', deductionSummary: '未体现关键节点控制，逻辑关系描述较笼统。' },
    { id: '3', name: '安全文明施工措施', category: '安全文明', score: 5, maxScore: 10, riskLevel: 'medium', deductionSummary: '安全措施描述笼统，缺乏针对性应急预案。' },
    { id: '4', name: '项目管理机构配置', category: '项目管理', score: 3, maxScore: 8, riskLevel: 'high', deductionSummary: '岗位职责说明缺失，部分关键岗位人员资质证明不清晰。' },
    { id: '5', name: '施工现场平面布置', category: '施工组织', score: 2, maxScore: 7, riskLevel: 'high', deductionSummary: '现场组织方案不足，临时设施布置不符合规范要求。' },
    { id: '6', name: '质量管理体系', category: '质量保证', score: 8, maxScore: 10, riskLevel: 'low', deductionSummary: '体系文件较完整，但部分流程优化建议不足。' },
    { id: '7', name: '劳动力配备计划', category: '资源配置', score: 5, maxScore: 5, riskLevel: 'none' },
    { id: '8', name: '主要材料供应计划', category: '资源配置', score: 3.5, maxScore: 5, riskLevel: 'low', deductionSummary: '供应商名录更新不及时。' },
    { id: '9', name: '环境保护措施', category: '安全文明', score: 5, maxScore: 5, riskLevel: 'none' },
    { id: '10', name: '关键工序技术方案', category: '施工组织', score: 10, maxScore: 10, riskLevel: 'none' },
  ]
};

export const MOCK_CREDIT_RESULTS: CreditCheckItem[] = [
  {
    id: 'c1',
    index: '1',
    status: 'fail',
    name: '拟派项目负责人三类人员B类证书',
    requirement: '提供拟派项目负责人三类人员B类证书；根据浙江省水利厅浙水监督〔2020〕1号文件，本项目三类人员证书应为电子证书，省外企业三类人员证书及水利部颁发的证书可以扫描件加盖公章上传，否则视为无效标处理；证书应在有效期内，已在有效期外尚在办理延期过程中的视为无效；资料应在投标文件中附复制件，已在有关行政主管部门（包括浙江省水利厅透明工程应用）公示或有电子件的可附网页截图或电子件，并加盖投标人公章。',
    location: '招标文件 P12',
    requirementLocation: '招标文件 P12 第3.1.1条',
    responses: [
      {
        sourceFile: '资格审查材料.pdf',
        texts: [
          { label: '企业名称', value: '某建筑工程有限公司' },
          { label: '资质等级', value: '建筑工程施工总承包二级' }
        ],
        materials: ['企业营业执照', '资质证书']
      },
      {
        sourceFile: '其他项目材料.pdf',
        texts: [
          { label: '三类人员持证情况', value: '缺失其他成员证件' }
        ],
        materials: ['项目经理B类证书扫描件']
      }
    ],
    responseLocation: '投标文件 P45 资质证明部分',
    explanation: [
      '将营业执照的企业名称与投标函的企业名称不一致',
      '将营业执照的经营范围与招标文件中的本项目专业属性不符'
    ]
  },
  {
    id: 'c2',
    index: '2',
    status: 'pass',
    name: '投标保证金交纳证明资料',
    requirement: '提供投标保证金交纳证明资料：银行转账记录或银行保函或保险机构保险保单或融资担保公司保函或免交证明。',
    location: '招标文件 P13',
    requirementLocation: '招标文件 P13 第3.1.2条',
    responses: [
      {
        sourceFile: '资信标.pdf',
        texts: [
          { label: '保证金缴纳金额', value: '100,000元' },
          { label: '缴纳方式', value: '银行转账' }
        ],
        materials: ['银行转账记录']
      }
    ],
    responseLocation: '投标文件 P58 业绩证明材料',
    explanation: ['符合招标文件要求']
  },
  {
    id: 'c3',
    index: '3',
    status: 'manual',
    name: '项目经理执业资格',
    requirement: '拟派项目经理须具备一级注册建造师执业资格，且具有有效的安全生产考核合格证书（B证）。',
    location: '招标文件 P14',
    requirementLocation: '招标文件 P14 第3.1.3条',
    responses: [
      {
        sourceFile: '资信标.pdf',
        texts: [
          { label: '项目经理', value: '张三' },
          { label: '注册级别', value: '一级' }
        ],
        materials: ['项目经理执业证', '安全考核B证']
      }
    ],
    responseLocation: '投标文件 P65 人员资质部分',
    explanation: ['B证扫描件较模糊，需人工核实原件或清晰扫描件。']
  },
  {
    id: 'c4',
    index: '4',
    status: 'pass',
    name: '企业纳税证明',
    requirement: '提供近三个月（2023年10月-12月）的完税证明复印件。',
    location: '招标文件 P15',
    requirementLocation: '招标文件 P15 第3.1.4条',
    responses: [
      {
        sourceFile: '资信标.pdf',
        materials: ['2023年10月完税证明', '2023年11月完税证明', '2023年12月完税证明']
      }
    ],
    responseLocation: '投标文件 P80 财务证明部分',
    explanation: ['完税证明齐全，符合要求。']
  },
  {
    id: 'c5',
    index: '5',
    status: 'fail',
    name: '社保缴纳证明',
    requirement: '提供拟派项目负责人及主要人员近三个月（2023年10月-12月）的社保缴纳证明。',
    location: '招标文件 P16',
    requirementLocation: '招标文件 P16 第3.1.5条',
    responses: [
      {
        sourceFile: '资信标.pdf',
        materials: ['2023年10月社保记录', '2023年11月社保记录']
      }
    ],
    responseLocation: '投标文件 P92 社保缴纳证明',
    explanation: [
      '仅提供了2023年10月和11月的社保缴纳证明，缺少12月份材料',
      '部分人员社保缴纳基数不符合当地最低标准'
    ]
  }
];
