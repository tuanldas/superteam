'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  loadTeamConfig,
  saveTeamConfig,
  isTeamActive,
  getTeamName,
  detectCICD,
  detectUIFramework,
  estimateProjectSize,
  estimateFromArtifacts,
  getRecommendedRoles,
  assembleTeam,
  buildTeamContext,
  countSourceFiles,
  ROLE_DEFINITIONS,
  TEAM_PRESETS,
} = require('../core/team.cjs');

// ---------------------------------------------------------------------------
// Hàm hỗ trợ
// ---------------------------------------------------------------------------

function taoThuMucTam() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'st-team-feat-'));
}

function xoaThuMucTam(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

/** Tạo N file source trong dir/src/ */
function gieoFileSource(dir, soLuong, ext = '.js') {
  const src = path.join(dir, 'src');
  fs.mkdirSync(src, { recursive: true });
  for (let i = 0; i < soLuong; i++) {
    fs.writeFileSync(path.join(src, `file${i}${ext}`), `// file ${i}`);
  }
}

/** Tạo ROADMAP.md với N phases */
function gieoRoadmap(dir, phases) {
  const stDir = path.join(dir, '.superteam');
  fs.mkdirSync(stDir, { recursive: true });
  const content = phases.map((p, i) => `# Phase ${i + 1}: ${p}`).join('\n');
  fs.writeFileSync(path.join(stDir, 'ROADMAP.md'), content);
}

/** Tạo các marker CI/CD */
function gieoCICD(dir, marker) {
  if (marker.includes('/')) {
    fs.mkdirSync(path.join(dir, marker), { recursive: true });
  } else {
    fs.writeFileSync(path.join(dir, marker), '');
  }
}

// ============================================================================
// Tính năng 1: Thành phần team theo loại dự án
// ============================================================================

describe('Tính năng: Thành phần team theo loại dự án', () => {

  it('frontend nhỏ → SM + Dev + QA (3 vai, không có Tech Lead)', () => {
    const dir = taoThuMucTam();
    try {
      gieoFileSource(dir, 10);
      const result = assembleTeam(dir, { type: 'frontend', frameworks: [], workspaces: [] }, {}, 'small');
      const danhSachVai = result.members.map(m => m.role);
      assert.deepStrictEqual(danhSachVai, ['scrum-master', 'developer', 'qa-engineer']);
      assert.strictEqual(result.members.length, 3);
    } finally { xoaThuMucTam(dir); }
  });

  it('frontend trung bình + react → SM + Dev + QA + UX Designer (4 vai)', () => {
    const dir = taoThuMucTam();
    try {
      const result = assembleTeam(dir, { type: 'frontend', frameworks: ['react'], workspaces: [] }, {}, 'medium');
      const danhSachVai = result.members.map(m => m.role);
      assert.ok(danhSachVai.includes('scrum-master'));
      assert.ok(danhSachVai.includes('developer'));
      assert.ok(danhSachVai.includes('qa-engineer'));
      assert.ok(danhSachVai.includes('ux-designer'));
      assert.strictEqual(result.members.length, 4);
    } finally { xoaThuMucTam(dir); }
  });

  it('backend trung bình → đủ 5 vai core', () => {
    const dir = taoThuMucTam();
    try {
      const result = assembleTeam(dir, { type: 'backend', frameworks: ['express'], workspaces: [] }, {}, 'medium');
      const danhSachVai = result.members.map(m => m.role);
      assert.deepStrictEqual(danhSachVai, [
        'scrum-master', 'tech-lead', 'senior-developer', 'developer', 'qa-engineer',
      ]);
    } finally { xoaThuMucTam(dir); }
  });

  it('backend nhỏ → gộp Tech Lead + Senior Dev, developer upgrade opus', () => {
    const dir = taoThuMucTam();
    try {
      const result = assembleTeam(dir, { type: 'backend', frameworks: ['express'], workspaces: [] }, {}, 'small');
      const danhSachVai = result.members.map(m => m.role);
      assert.ok(!danhSachVai.includes('tech-lead'), 'Tech Lead phải được gộp');
      assert.ok(!danhSachVai.includes('senior-developer'), 'Senior Dev phải được gộp');
      assert.ok(danhSachVai.includes('scrum-master'));
      assert.ok(danhSachVai.includes('developer'));
      assert.ok(danhSachVai.includes('qa-engineer'));
      assert.ok(result.roles.collapsed !== null);
      const dev = result.members.find(m => m.role === 'developer');
      assert.strictEqual(dev.model, 'opus', 'Developer phải được upgrade lên opus khi gộp');
    } finally { xoaThuMucTam(dir); }
  });

  it('fullstack trung bình + react → 5 core + UX Designer (6 vai)', () => {
    const dir = taoThuMucTam();
    try {
      const result = assembleTeam(dir, { type: 'fullstack', frameworks: ['react', 'express'], workspaces: [] }, {}, 'medium');
      assert.ok(result.members.some(m => m.role === 'ux-designer'));
      assert.strictEqual(result.members.length, 6);
    } finally { xoaThuMucTam(dir); }
  });

  it('fullstack lớn + react + CI/CD → 5 core + UX + DevOps + Dev 2 (8 vai)', () => {
    const dir = taoThuMucTam();
    try {
      gieoCICD(dir, 'Dockerfile');
      const result = assembleTeam(dir, { type: 'fullstack', frameworks: ['react'], workspaces: [] }, {}, 'large');
      const danhSachVai = result.members.map(m => m.role);
      assert.ok(danhSachVai.includes('ux-designer'), 'Phải có UX Designer');
      assert.ok(danhSachVai.includes('devops-engineer'), 'Phải có DevOps');
      const soDev = danhSachVai.filter(r => r === 'developer').length;
      assert.ok(soDev >= 2, `Phải có 2+ developer, thực tế có ${soDev}`);
    } finally { xoaThuMucTam(dir); }
  });

  it('monorepo trung bình → 5 core + Dev 2 (6 vai)', () => {
    const dir = taoThuMucTam();
    try {
      const result = assembleTeam(dir, { type: 'monorepo', frameworks: [], workspaces: ['packages/a', 'packages/b'] }, {}, 'medium');
      const devs = result.members.filter(m => m.role === 'developer');
      assert.ok(devs.length >= 2, 'Monorepo phải có developer thứ 2');
    } finally { xoaThuMucTam(dir); }
  });

  it('python trung bình → SM + Dev + QA (3 vai, không Tech Lead)', () => {
    const dir = taoThuMucTam();
    try {
      const result = assembleTeam(dir, { type: 'python', frameworks: ['flask'], workspaces: [] }, {}, 'medium');
      const danhSachVai = result.members.map(m => m.role);
      assert.deepStrictEqual(danhSachVai, ['scrum-master', 'developer', 'qa-engineer']);
    } finally { xoaThuMucTam(dir); }
  });

  it('rust trung bình → đủ 5 vai core (Tech Lead bắt buộc)', () => {
    const dir = taoThuMucTam();
    try {
      const result = assembleTeam(dir, { type: 'rust', frameworks: [], workspaces: [] }, {}, 'medium');
      const danhSachVai = result.members.map(m => m.role);
      assert.ok(danhSachVai.includes('tech-lead'), 'Rust bắt buộc có Tech Lead');
      assert.ok(danhSachVai.includes('senior-developer'), 'Rust bắt buộc có Senior Dev');
    } finally { xoaThuMucTam(dir); }
  });

  it('go trung bình → đủ 5 vai core', () => {
    const dir = taoThuMucTam();
    try {
      const result = assembleTeam(dir, { type: 'go', frameworks: [], workspaces: [] }, {}, 'medium');
      assert.strictEqual(result.members.length, 5);
      assert.ok(result.members.some(m => m.role === 'tech-lead'));
    } finally { xoaThuMucTam(dir); }
  });

  it('php trung bình → đủ 5 vai core', () => {
    const dir = taoThuMucTam();
    try {
      const result = assembleTeam(dir, { type: 'php', frameworks: ['laravel'], workspaces: [] }, {}, 'medium');
      assert.strictEqual(result.members.length, 5);
    } finally { xoaThuMucTam(dir); }
  });

  it('loại không xác định → tối thiểu SM + Dev + QA', () => {
    const dir = taoThuMucTam();
    try {
      const result = assembleTeam(dir, { type: 'unknown', frameworks: [], workspaces: [] }, {}, 'medium');
      assert.deepStrictEqual(
        result.members.map(m => m.role),
        ['scrum-master', 'developer', 'qa-engineer'],
      );
    } finally { xoaThuMucTam(dir); }
  });
});

// ============================================================================
// Tính năng 2: Chuỗi ưu tiên phát hiện kích thước dự án
// ============================================================================

describe('Tính năng: Chuỗi ưu tiên phát hiện kích thước', () => {

  it('Ưu tiên 1: --size ghi đè mọi thứ', () => {
    const dir = taoThuMucTam();
    try {
      gieoFileSource(dir, 5);
      const config = { team: { size: 'medium' } };
      const result = estimateProjectSize(dir, config, 'large');
      assert.strictEqual(result.size, 'large');
      assert.strictEqual(result.signal, 'user-override');
    } finally { xoaThuMucTam(dir); }
  });

  it('Ưu tiên 2: config thắng artifacts và file count', () => {
    const dir = taoThuMucTam();
    try {
      gieoFileSource(dir, 5);   // đếm file → nhỏ
      gieoRoadmap(dir, ['Init', 'Core', 'Features', 'Test', 'Deploy']); // artifacts → lớn
      const config = { team: { size: 'medium' } };
      const result = estimateProjectSize(dir, config, null);
      assert.strictEqual(result.size, 'medium');
      assert.strictEqual(result.signal, 'config');
    } finally { xoaThuMucTam(dir); }
  });

  it('Ưu tiên 3: artifacts thắng file count', () => {
    const dir = taoThuMucTam();
    try {
      gieoFileSource(dir, 5);   // đếm file → nhỏ
      gieoRoadmap(dir, ['Init', 'Core', 'Features', 'Test', 'Deploy']); // artifacts → lớn
      const result = estimateProjectSize(dir, {}, null);
      assert.strictEqual(result.size, 'large');
      assert.strictEqual(result.signal, 'project-artifacts');
    } finally { xoaThuMucTam(dir); }
  });

  it('Ưu tiên 4: đếm file khi không có tín hiệu cao hơn', () => {
    const dir = taoThuMucTam();
    try {
      gieoFileSource(dir, 50);
      const result = estimateProjectSize(dir, {}, null);
      assert.strictEqual(result.size, 'medium');
      assert.strictEqual(result.signal, 'file-count');
    } finally { xoaThuMucTam(dir); }
  });

  it('Ưu tiên 5: mặc định medium cho greenfield (0 file)', () => {
    const dir = taoThuMucTam();
    try {
      const result = estimateProjectSize(dir, {}, null);
      assert.strictEqual(result.size, 'medium');
      assert.strictEqual(result.signal, 'default');
    } finally { xoaThuMucTam(dir); }
  });

  it('ranh giới đếm file: 19 → nhỏ, 20 → trung bình, 100 → lớn', () => {
    const dir1 = taoThuMucTam();
    try {
      gieoFileSource(dir1, 19);
      assert.strictEqual(estimateProjectSize(dir1, {}, null).size, 'small');
    } finally { xoaThuMucTam(dir1); }

    const dir2 = taoThuMucTam();
    try {
      gieoFileSource(dir2, 20);
      assert.strictEqual(estimateProjectSize(dir2, {}, null).size, 'medium');
    } finally { xoaThuMucTam(dir2); }

    const dir3 = taoThuMucTam();
    try {
      gieoFileSource(dir3, 100);
      assert.strictEqual(estimateProjectSize(dir3, {}, null).size, 'large');
    } finally { xoaThuMucTam(dir3); }
  });

  it('phát hiện từ artifacts: 1-2 phases → nhỏ, 3-4 → trung bình, 5+ → lớn', () => {
    const dir1 = taoThuMucTam();
    try {
      gieoRoadmap(dir1, ['Init', 'Core']);
      assert.strictEqual(estimateFromArtifacts(dir1), 'small');
    } finally { xoaThuMucTam(dir1); }

    const dir2 = taoThuMucTam();
    try {
      gieoRoadmap(dir2, ['Init', 'Core', 'Features']);
      assert.strictEqual(estimateFromArtifacts(dir2), 'medium');
    } finally { xoaThuMucTam(dir2); }

    const dir3 = taoThuMucTam();
    try {
      gieoRoadmap(dir3, ['Init', 'Core', 'Features', 'Test', 'Deploy']);
      assert.strictEqual(estimateFromArtifacts(dir3), 'large');
    } finally { xoaThuMucTam(dir3); }
  });
});

// ============================================================================
// Tính năng 3: Phát hiện tín hiệu mở rộng
// ============================================================================

describe('Tính năng: Phát hiện tín hiệu mở rộng team', () => {

  it('phát hiện tất cả marker CI/CD được hỗ trợ', () => {
    const markers = [
      '.github/workflows', 'Dockerfile', 'docker-compose.yml',
      'docker-compose.yaml', '.gitlab-ci.yml', 'Jenkinsfile',
      'bitbucket-pipelines.yml',
    ];
    for (const marker of markers) {
      const dir = taoThuMucTam();
      try {
        gieoCICD(dir, marker);
        assert.ok(detectCICD(dir), `Phải phát hiện CI/CD từ ${marker}`);
      } finally { xoaThuMucTam(dir); }
    }
  });

  it('phát hiện tất cả UI framework được hỗ trợ', () => {
    const frameworks = ['react', 'vue', '@angular/core', 'svelte', 'next', 'nuxt', 'remix'];
    for (const fw of frameworks) {
      assert.ok(
        detectUIFramework({ frameworks: [fw] }),
        `Phải phát hiện UI framework: ${fw}`,
      );
    }
  });

  it('KHÔNG phát hiện backend framework là UI', () => {
    const nonUI = ['express', 'fastify', 'koa', 'nestjs', 'flask', 'django', 'gin'];
    for (const fw of nonUI) {
      assert.ok(
        !detectUIFramework({ frameworks: [fw] }),
        `KHÔNG được phát hiện ${fw} là UI framework`,
      );
    }
  });

  it('tín hiệu CI/CD thêm devops-engineer vào team', () => {
    const dir = taoThuMucTam();
    try {
      gieoCICD(dir, 'Dockerfile');
      const result = assembleTeam(
        dir,
        { type: 'backend', frameworks: ['express'], workspaces: [] },
        {}, 'medium',
      );
      assert.ok(result.members.some(m => m.role === 'devops-engineer'));
    } finally { xoaThuMucTam(dir); }
  });

  it('tín hiệu UI framework thêm ux-designer vào team', () => {
    const dir = taoThuMucTam();
    try {
      const result = assembleTeam(
        dir,
        { type: 'backend', frameworks: ['react'], workspaces: [] },
        {}, 'medium',
      );
      assert.ok(result.members.some(m => m.role === 'ux-designer'));
    } finally { xoaThuMucTam(dir); }
  });

  it('không có tín hiệu → không có vai tùy chọn', () => {
    const dir = taoThuMucTam();
    try {
      const result = assembleTeam(
        dir,
        { type: 'backend', frameworks: ['express'], workspaces: [] },
        {}, 'medium',
      );
      assert.ok(!result.members.some(m => m.role === 'ux-designer'));
      assert.ok(!result.members.some(m => m.role === 'devops-engineer'));
    } finally { xoaThuMucTam(dir); }
  });
});

// ============================================================================
// Tính năng 4: Vòng đời team (tạo → hoạt động → giải tán)
// ============================================================================

describe('Tính năng: Vòng đời team', () => {
  let thuMuc;
  before(() => { thuMuc = taoThuMucTam(); });
  after(() => { xoaThuMucTam(thuMuc); });

  it('ban đầu chưa có team', () => {
    assert.strictEqual(isTeamActive(thuMuc), false);
    assert.strictEqual(loadTeamConfig(thuMuc), null);
  });

  it('tạo team → trạng thái active', () => {
    const assembly = assembleTeam(
      thuMuc,
      { type: 'fullstack', frameworks: ['react'], workspaces: [] },
      {}, 'medium',
    );
    saveTeamConfig(thuMuc, {
      team_name: assembly.team_name,
      project_type: assembly.project_type,
      size: assembly.size,
      status: 'active',
      created_at: new Date().toISOString(),
      members: assembly.members,
    });
    assert.strictEqual(isTeamActive(thuMuc), true);
  });

  it('config team lưu đầy đủ các trường', () => {
    const config = loadTeamConfig(thuMuc);
    assert.ok(config.team_name);
    assert.strictEqual(config.project_type, 'fullstack');
    assert.strictEqual(config.size, 'medium');
    assert.strictEqual(config.status, 'active');
    assert.ok(config.created_at);
    assert.ok(Array.isArray(config.members));
    assert.ok(config.members.length >= 5);
  });

  it('buildTeamContext hiển thị thông tin team đang hoạt động', () => {
    const context = buildTeamContext(thuMuc);
    assert.ok(context !== null);
    assert.ok(context.includes('Active team'));
    assert.ok(context.includes('members'));
  });

  it('giải tán team → không còn active', () => {
    const config = loadTeamConfig(thuMuc);
    config.status = 'disbanded';
    saveTeamConfig(thuMuc, config);
    assert.strictEqual(isTeamActive(thuMuc), false);
  });

  it('buildTeamContext trả về null sau khi giải tán', () => {
    assert.strictEqual(buildTeamContext(thuMuc), null);
  });

  it('config team được giữ lại sau khi giải tán (để lưu kiến thức)', () => {
    const config = loadTeamConfig(thuMuc);
    assert.ok(config !== null);
    assert.strictEqual(config.status, 'disbanded');
    assert.ok(config.members.length >= 5);
  });

  it('có thể tạo lại team sau khi giải tán', () => {
    saveTeamConfig(thuMuc, {
      team_name: 'team-moi',
      status: 'active',
      members: [{ role: 'scrum-master', name: 'scrum-master', model: 'opus' }],
    });
    assert.strictEqual(isTeamActive(thuMuc), true);
    assert.strictEqual(loadTeamConfig(thuMuc).team_name, 'team-moi');
  });
});

// ============================================================================
// Tính năng 5: Quy ước đặt tên thành viên
// ============================================================================

describe('Tính năng: Quy ước đặt tên thành viên', () => {

  it('scrum-master luôn có tên là "scrum-master"', () => {
    const dir = taoThuMucTam();
    try {
      const result = assembleTeam(dir, { type: 'backend', frameworks: [], workspaces: [] }, {}, 'medium');
      const sm = result.members.find(m => m.role === 'scrum-master');
      assert.strictEqual(sm.name, 'scrum-master');
    } finally { xoaThuMucTam(dir); }
  });

  it('developer đơn lẻ có tên là "dev"', () => {
    const dir = taoThuMucTam();
    try {
      const result = assembleTeam(dir, { type: 'python', frameworks: [], workspaces: [] }, {}, 'medium');
      const devs = result.members.filter(m => m.role === 'developer');
      assert.strictEqual(devs.length, 1);
      assert.strictEqual(devs[0].name, 'dev');
    } finally { xoaThuMucTam(dir); }
  });

  it('nhiều developer được đánh số: dev, dev-2', () => {
    const dir = taoThuMucTam();
    try {
      const result = assembleTeam(
        dir,
        { type: 'monorepo', frameworks: [], workspaces: ['a', 'b'] },
        {}, 'large',
      );
      const devs = result.members.filter(m => m.role === 'developer');
      assert.ok(devs.length >= 2);
      assert.strictEqual(devs[0].name, 'dev');
      assert.strictEqual(devs[1].name, 'dev-2');
    } finally { xoaThuMucTam(dir); }
  });

  it('tất cả tên thành viên là duy nhất trong team', () => {
    const dir = taoThuMucTam();
    try {
      gieoCICD(dir, 'Dockerfile');
      const result = assembleTeam(
        dir,
        { type: 'fullstack', frameworks: ['react'], workspaces: [] },
        {}, 'large',
      );
      const danhSachTen = result.members.map(m => m.name);
      const tenDuyNhat = new Set(danhSachTen);
      assert.strictEqual(
        danhSachTen.length, tenDuyNhat.size,
        `Phát hiện tên trùng: ${danhSachTen.join(', ')}`,
      );
    } finally { xoaThuMucTam(dir); }
  });

  it('vai tùy chọn dùng tên vai làm tên agent', () => {
    const dir = taoThuMucTam();
    try {
      gieoCICD(dir, 'Dockerfile');
      const result = assembleTeam(
        dir,
        { type: 'backend', frameworks: ['react'], workspaces: [] },
        {}, 'medium',
      );
      const ux = result.members.find(m => m.role === 'ux-designer');
      const devops = result.members.find(m => m.role === 'devops-engineer');
      assert.ok(ux);
      assert.strictEqual(ux.name, 'ux-designer');
      assert.ok(devops);
      assert.strictEqual(devops.name, 'devops-engineer');
    } finally { xoaThuMucTam(dir); }
  });
});

// ============================================================================
// Tính năng 6: Gán model cho từng vai trò
// ============================================================================

describe('Tính năng: Gán model cho từng vai trò', () => {

  it('vai lãnh đạo (SM, TL, Senior Dev) dùng opus', () => {
    const dir = taoThuMucTam();
    try {
      const result = assembleTeam(dir, { type: 'backend', frameworks: [], workspaces: [] }, {}, 'medium');
      for (const vai of ['scrum-master', 'tech-lead', 'senior-developer']) {
        const member = result.members.find(m => m.role === vai);
        assert.ok(member, `Phải có ${vai}`);
        assert.strictEqual(member.model, 'opus', `${vai} phải dùng opus`);
      }
    } finally { xoaThuMucTam(dir); }
  });

  it('vai thực thi (Dev, QA) dùng sonnet', () => {
    const dir = taoThuMucTam();
    try {
      const result = assembleTeam(dir, { type: 'backend', frameworks: [], workspaces: [] }, {}, 'medium');
      for (const vai of ['developer', 'qa-engineer']) {
        const member = result.members.find(m => m.role === vai);
        assert.ok(member, `Phải có ${vai}`);
        assert.strictEqual(member.model, 'sonnet', `${vai} phải dùng sonnet`);
      }
    } finally { xoaThuMucTam(dir); }
  });

  it('vai tùy chọn dùng sonnet', () => {
    const dir = taoThuMucTam();
    try {
      gieoCICD(dir, 'Dockerfile');
      const result = assembleTeam(
        dir,
        { type: 'backend', frameworks: ['react'], workspaces: [] },
        {}, 'medium',
      );
      for (const vai of ['ux-designer', 'devops-engineer']) {
        const member = result.members.find(m => m.role === vai);
        assert.ok(member, `Phải có ${vai}`);
        assert.strictEqual(member.model, 'sonnet', `${vai} phải dùng sonnet`);
      }
    } finally { xoaThuMucTam(dir); }
  });
});

// ============================================================================
// Tính năng 7: Trường hợp biên đếm file source
// ============================================================================

describe('Tính năng: Trường hợp biên đếm file source', () => {

  it('bỏ qua tất cả thư mục bị loại trừ', () => {
    const loaiTru = ['node_modules', 'vendor', 'dist', 'build', '.next', '__pycache__', 'target'];
    for (const tenThuMuc of loaiTru) {
      const dir = taoThuMucTam();
      try {
        fs.mkdirSync(path.join(dir, tenThuMuc), { recursive: true });
        fs.writeFileSync(path.join(dir, tenThuMuc, 'file.js'), '');
        fs.writeFileSync(path.join(dir, 'app.js'), '');
        assert.strictEqual(countSourceFiles(dir), 1, `Phải bỏ qua ${tenThuMuc}/`);
      } finally { xoaThuMucTam(dir); }
    }
  });

  it('đếm tất cả phần mở rộng source được hỗ trợ', () => {
    const exts = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte', '.py', '.go', '.rs', '.php'];
    const dir = taoThuMucTam();
    try {
      for (const ext of exts) {
        fs.writeFileSync(path.join(dir, `file${ext}`), '');
      }
      assert.strictEqual(countSourceFiles(dir), exts.length);
    } finally { xoaThuMucTam(dir); }
  });

  it('KHÔNG đếm file .md, .txt, .lock, .log', () => {
    const dir = taoThuMucTam();
    try {
      fs.writeFileSync(path.join(dir, 'README.md'), '');
      fs.writeFileSync(path.join(dir, 'notes.txt'), '');
      fs.writeFileSync(path.join(dir, 'yarn.lock'), '');
      fs.writeFileSync(path.join(dir, 'debug.log'), '');
      fs.writeFileSync(path.join(dir, 'app.js'), '');  // chỉ file này được đếm
      assert.strictEqual(countSourceFiles(dir), 1);
    } finally { xoaThuMucTam(dir); }
  });

  it('tôn trọng giới hạn maxDepth', () => {
    const dir = taoThuMucTam();
    try {
      const deepDir = path.join(dir, 'a', 'b', 'c', 'd', 'e', 'f', 'g');
      fs.mkdirSync(deepDir, { recursive: true });
      fs.writeFileSync(path.join(deepDir, 'deep.js'), '');
      fs.writeFileSync(path.join(dir, 'shallow.js'), '');
      // maxDepth mặc định = 5, nên depth 7 bị bỏ qua
      assert.strictEqual(countSourceFiles(dir), 1);
    } finally { xoaThuMucTam(dir); }
  });

  it('xử lý thư mục trống không lỗi', () => {
    const dir = taoThuMucTam();
    try {
      assert.strictEqual(countSourceFiles(dir), 0);
    } finally { xoaThuMucTam(dir); }
  });

  it('xử lý lỗi quyền truy cập không crash', () => {
    const dir = taoThuMucTam();
    try {
      assert.strictEqual(countSourceFiles(path.join(dir, 'khong-ton-tai')), 0);
    } finally { xoaThuMucTam(dir); }
  });
});

// ============================================================================
// Tính năng 8: Trường hợp biên đặt tên team
// ============================================================================

describe('Tính năng: Trường hợp biên đặt tên team', () => {

  it('chuyển tên thư mục sang chữ thường', () => {
    assert.strictEqual(getTeamName('/home/user/MyProject'), 'myproject-team');
  });

  it('thay dấu cách bằng gạch ngang', () => {
    assert.strictEqual(getTeamName('/home/user/my project'), 'my-project-team');
  });

  it('thay gạch dưới bằng gạch ngang', () => {
    assert.strictEqual(getTeamName('/home/user/my_project'), 'my-project-team');
  });

  it('loại bỏ ký tự đặc biệt', () => {
    assert.strictEqual(getTeamName('/home/user/my@project!v2'), 'my-project-v2-team');
  });

  it('xử lý thư mục tên 1 ký tự', () => {
    assert.strictEqual(getTeamName('/home/user/x'), 'x-team');
  });
});

// ============================================================================
// Tính năng 9: Tính toàn vẹn định nghĩa vai trò
// ============================================================================

describe('Tính năng: Tính toàn vẹn định nghĩa vai trò', () => {

  it('mỗi vai có model, type và description', () => {
    for (const [ten, dinh_nghia] of Object.entries(ROLE_DEFINITIONS)) {
      assert.ok(dinh_nghia.model, `${ten} thiếu model`);
      assert.ok(['opus', 'sonnet'].includes(dinh_nghia.model), `${ten} có model không hợp lệ: ${dinh_nghia.model}`);
      assert.ok(dinh_nghia.type, `${ten} thiếu type`);
      assert.ok(['core', 'optional'].includes(dinh_nghia.type), `${ten} có type không hợp lệ: ${dinh_nghia.type}`);
      assert.ok(dinh_nghia.description, `${ten} thiếu description`);
    }
  });

  it('scrum-master luôn đứng đầu mọi preset', () => {
    for (const [loai, roles] of Object.entries(TEAM_PRESETS)) {
      assert.strictEqual(roles[0], 'scrum-master', `preset ${loai} phải bắt đầu bằng scrum-master`);
    }
  });

  it('mỗi vai trong preset đều tồn tại trong ROLE_DEFINITIONS', () => {
    for (const [loai, roles] of Object.entries(TEAM_PRESETS)) {
      for (const role of roles) {
        assert.ok(ROLE_DEFINITIONS[role], `preset ${loai} tham chiếu vai không tồn tại: ${role}`);
      }
    }
  });

  it('vai core đánh dấu core, vai tùy chọn đánh dấu optional', () => {
    const vaiTrongPreset = new Set();
    for (const roles of Object.values(TEAM_PRESETS)) {
      roles.forEach(r => vaiTrongPreset.add(r));
    }
    for (const role of vaiTrongPreset) {
      assert.strictEqual(
        ROLE_DEFINITIONS[role].type, 'core',
        `${role} xuất hiện trong preset nhưng được đánh dấu ${ROLE_DEFINITIONS[role].type}`,
      );
    }
    for (const [ten, dinh_nghia] of Object.entries(ROLE_DEFINITIONS)) {
      if (dinh_nghia.type === 'optional') {
        assert.ok(!vaiTrongPreset.has(ten), `Vai optional ${ten} không được nằm trong preset`);
      }
    }
  });
});

// ============================================================================
// Tính năng 10: Kiểm tra file agent vai trò
// ============================================================================

describe('Tính năng: Kiểm tra file agent vai trò', () => {
  const thuMucAgents = path.resolve(__dirname, '..', 'agents');
  const fileAgent = [
    'scrum-master.md', 'tech-lead.md', 'senior-developer.md',
    'developer.md', 'qa-engineer.md', 'ux-designer.md', 'devops-engineer.md',
  ];

  it('tất cả file agent vai trò tồn tại', () => {
    for (const file of fileAgent) {
      assert.ok(
        fs.existsSync(path.join(thuMucAgents, file)),
        `Thiếu file agent: ${file}`,
      );
    }
  });

  it('mỗi agent vai trò có phần <role> định nghĩa danh tính', () => {
    for (const file of fileAgent) {
      const noiDung = fs.readFileSync(path.join(thuMucAgents, file), 'utf8');
      assert.ok(noiDung.includes('<role>'), `${file} thiếu phần <role>`);
    }
  });

  it('mỗi agent vai trò có phần <rules> với mệnh đề NEVER', () => {
    for (const file of fileAgent) {
      const noiDung = fs.readFileSync(path.join(thuMucAgents, file), 'utf8');
      assert.ok(noiDung.includes('<rules>'), `${file} thiếu phần <rules>`);
      assert.ok(noiDung.includes('NEVER'), `${file} thiếu mệnh đề giới hạn NEVER`);
    }
  });

  it('mỗi agent vai trò có phần <methodology>', () => {
    for (const file of fileAgent) {
      const noiDung = fs.readFileSync(path.join(thuMucAgents, file), 'utf8');
      assert.ok(noiDung.includes('<methodology>'), `${file} thiếu phần <methodology>`);
    }
  });

  it('scrum-master tham chiếu TaskCreate và SendMessage', () => {
    const noiDung = fs.readFileSync(path.join(thuMucAgents, 'scrum-master.md'), 'utf8');
    assert.ok(noiDung.includes('TaskCreate'), 'SM phải tham chiếu TaskCreate');
    assert.ok(noiDung.includes('SendMessage'), 'SM phải tham chiếu SendMessage');
  });

  it('developer và senior-developer tham chiếu atomic commits', () => {
    for (const file of ['developer.md', 'senior-developer.md']) {
      const noiDung = fs.readFileSync(path.join(thuMucAgents, file), 'utf8');
      assert.ok(
        noiDung.toLowerCase().includes('commit'),
        `${file} phải tham chiếu phương pháp commit`,
      );
    }
  });

  it('qa-engineer tham chiếu verification', () => {
    const noiDung = fs.readFileSync(path.join(thuMucAgents, 'qa-engineer.md'), 'utf8');
    assert.ok(noiDung.includes('verif'), 'QA phải tham chiếu verification');
  });

  it('scrum-master có quy tắc NEVER viết code', () => {
    const noiDung = fs.readFileSync(path.join(thuMucAgents, 'scrum-master.md'), 'utf8');
    assert.ok(noiDung.includes('NEVER write code') || noiDung.includes('NEVER implement code'));
  });

  it('developer có quy tắc NEVER quyết định kiến trúc', () => {
    const noiDung = fs.readFileSync(path.join(thuMucAgents, 'developer.md'), 'utf8');
    assert.ok(noiDung.includes('NEVER make architecture decisions'));
  });

  it('qa-engineer CÓ QUYỀN chặn merge', () => {
    const noiDung = fs.readFileSync(path.join(thuMucAgents, 'qa-engineer.md'), 'utf8');
    assert.ok(noiDung.includes('CAN block'));
  });
});

// ============================================================================
// Tính năng 11: Kiểm tra file skill
// ============================================================================

describe('Tính năng: Kiểm tra file skill team-coordination', () => {
  const thuMucSkill = path.resolve(__dirname, '..', 'skills', 'team-coordination');

  it('SKILL.md tồn tại và có frontmatter', () => {
    const noiDung = fs.readFileSync(path.join(thuMucSkill, 'SKILL.md'), 'utf8');
    assert.ok(noiDung.startsWith('---'), 'Phải có YAML frontmatter');
    assert.ok(noiDung.includes('name: team-coordination'));
  });

  it('SKILL.md định nghĩa cấp bậc quyết định', () => {
    const noiDung = fs.readFileSync(path.join(thuMucSkill, 'SKILL.md'), 'utf8');
    assert.ok(noiDung.includes('Decision Hierarchy') || noiDung.includes('decision hierarchy'));
  });

  it('SKILL.md định nghĩa giao thức giao tiếp', () => {
    const noiDung = fs.readFileSync(path.join(thuMucSkill, 'SKILL.md'), 'utf8');
    assert.ok(noiDung.includes('Communication Protocol') || noiDung.includes('communication'));
    assert.ok(noiDung.includes('SendMessage'));
  });

  it('SKILL.md định nghĩa giải quyết xung đột', () => {
    const noiDung = fs.readFileSync(path.join(thuMucSkill, 'SKILL.md'), 'utf8');
    assert.ok(noiDung.includes('Conflict Resolution') || noiDung.includes('conflict'));
  });

  it('team-roles-catalog.md tồn tại và bao phủ mọi loại dự án', () => {
    const noiDung = fs.readFileSync(path.join(thuMucSkill, 'references', 'team-roles-catalog.md'), 'utf8');
    const loaiDuAn = ['frontend', 'backend', 'fullstack', 'monorepo', 'php', 'go', 'python', 'rust', 'unknown'];
    for (const loai of loaiDuAn) {
      assert.ok(noiDung.includes(loai), `Catalog phải đề cập loại dự án: ${loai}`);
    }
  });

  it('team-roles-catalog.md mô tả thích ứng theo kích thước', () => {
    const noiDung = fs.readFileSync(path.join(thuMucSkill, 'references', 'team-roles-catalog.md'), 'utf8');
    assert.ok(noiDung.includes('Small') || noiDung.includes('small'));
    assert.ok(noiDung.includes('Medium') || noiDung.includes('medium'));
    assert.ok(noiDung.includes('Large') || noiDung.includes('large'));
  });
});

// ============================================================================
// Tính năng 12: Kiểm tra file command
// ============================================================================

describe('Tính năng: Kiểm tra file command team', () => {
  const duongDanCmd = path.resolve(__dirname, '..', 'commands', 'team.md');

  it('team.md tồn tại', () => {
    assert.ok(fs.existsSync(duongDanCmd));
  });

  it('có frontmatter với description và argument-hint', () => {
    const noiDung = fs.readFileSync(duongDanCmd, 'utf8');
    assert.ok(noiDung.startsWith('---'));
    assert.ok(noiDung.includes('description:'));
    assert.ok(noiDung.includes('argument-hint:'));
  });

  it('mô tả lệnh con create', () => {
    const noiDung = fs.readFileSync(duongDanCmd, 'utf8');
    assert.ok(noiDung.includes('create'));
    assert.ok(noiDung.includes('--size'));
  });

  it('mô tả lệnh con status', () => {
    const noiDung = fs.readFileSync(duongDanCmd, 'utf8');
    assert.ok(noiDung.includes('status'));
  });

  it('mô tả lệnh con disband', () => {
    const noiDung = fs.readFileSync(duongDanCmd, 'utf8');
    assert.ok(noiDung.includes('disband'));
    assert.ok(noiDung.includes('shutdown'));
  });

  it('mô tả routing ngôn ngữ tự nhiên', () => {
    const noiDung = fs.readFileSync(duongDanCmd, 'utf8');
    assert.ok(noiDung.includes('Natural Language') || noiDung.includes('natural language'));
    assert.ok(noiDung.includes('SendMessage'));
  });

  it('tham chiếu TeamCreate và TeamDelete', () => {
    const noiDung = fs.readFileSync(duongDanCmd, 'utf8');
    assert.ok(noiDung.includes('TeamCreate'));
    assert.ok(noiDung.includes('TeamDelete'));
  });
});
