# Diagrama de Classes - API TCC PRO

## Entidades principais

### Aluno

- uuidAluno: string
- nome: string
- matricula: string
- curso?: string
- email: string
- telefone?: string
- observacao?: string
- semestre?: string
- situacao?: string
- ativo: boolean
- createdAt: DateTime
- updatedAt: DateTime | null

Relações:

- hasMany(Tcc) via uuidAluno → uuid_aluno
- hasMany(TemaTcc) via uuidAluno → uuid_aluno
- hasMany(Usuario) via uuidAluno → uuid_aluno

---

### Professor

- uuidProfessor: string
- nome: string
- email: string
- ativo: boolean
- createdAt: DateTime
- updatedAt: DateTime | null

Relações:

- hasMany(Tcc) via uuidProfessor → uuid_orientador
- hasMany(TemaTcc) via uuidProfessor → uuid_professor
- hasMany(Avaliacao) via uuidProfessor → uuid_professor
- hasMany(Agenda) via uuidProfessor → uuid_professor

---

### TemaTcc

- uuidTemaTcc: string
- uuidAluno: string
- uuidProfessor?: string | null
- titulo: string
- descricao?: string
- area?: string
- linhaPesquisa?: string
- tags?: any
- ativo: boolean
- status: string
- createdAt: DateTime
- updatedAt: DateTime | null

Relações:

- belongsTo(Aluno) via uuidAluno → uuid_aluno
- belongsTo(Professor) via uuidProfessor → uuid_professor
- hasMany(Tcc) via uuidTemaTcc → uuid_tema_tcc

---

### Tcc

- uuidTcc: string
- uuidAluno: string
- uuidOrientador?: string | null
- uuidTemaTcc: string
- proximaEntrega?: string | null
- status: string
- createdAt: DateTime
- updatedAt: DateTime | null

Relações:

- belongsTo(Aluno) via uuidAluno → uuid_aluno
- belongsTo(Professor) via uuidOrientador → uuid_orientador
- belongsTo(TemaTcc) via uuidTemaTcc → uuid_tema_tcc
- hasMany(TccTimeline) via uuidTcc → uuid_tcc
- hasMany(TccNotificacao) via uuidTcc → uuid_tcc
- hasMany(Avaliacao) via uuidTcc → uuid_tcc
- hasMany(Agenda) via uuidTcc → uuid_tcc

---

### TccTimeline

- uuidTimeline: string
- uuidTcc: string
- titulo: string
- descricao?: string
- dataEntrega?: DateTime | null
- status: string
- createdAt: DateTime
- updatedAt: DateTime | null

Relações:

- belongsTo(Tcc) via uuidTcc → uuid_tcc

---

### TccNotificacao

- uuidTccNotificacao: string
- uuidTcc: string
- uuidUsuario?: string | null
- tipo: string
- descricao?: string
- status: string
- linkAcao?: string
- createdAt: DateTime
- updatedAt: DateTime | null

Relações:

- belongsTo(Tcc) via uuidTcc → uuid_tcc
- belongsTo(Usuario) via uuidUsuario → uuid_usuario

---

### Usuario

- uuidUsuario: string
- nome?: string
- email: string
- password: string
- ativo: boolean
- emailVerified: boolean
- uuidPerfil?: string | null
- uuidAluno?: string | null
- createdAt: DateTime
- updatedAt: DateTime | null

Relações:

- belongsTo(Perfil) via uuidPerfil → uuid_perfil
- belongsTo(Aluno) via uuidAluno → uuid_aluno
- hasMany(TccNotificacao) via uuidUsuario → uuid_usuario
- hasMany(AgendaParticipante) via uuidUsuario → uuid_usuario

---

### Perfil

- uuidPerfil: string
- nomePerfil?: string
- createdAt: DateTime
- updatedAt: DateTime | null

Relações:

- hasMany(PerfilRole) via uuidPerfil → uuidPerfil

---

### Role

- uuidRole: string
- codRole?: string
- desRole: string
- createdAt: DateTime
- updatedAt: DateTime | null

---

### PerfilRole

- uuidPerfil: string
- uuidRole: string
- createdAt: DateTime | null
- updatedAt: DateTime | null

Relações:

- belongsTo(Role) via uuidRole → uuidRole

---

### Agenda

- uuidAgenda: string
- uuidTcc: string
- uuidProfessor?: string | null
- modalidade: string
- data?: DateTime | null
- hora?: string | null
- linkReuniao?: string
- local?: string
- createdAt: DateTime
- updatedAt: DateTime | null

Relações:

- belongsTo(Tcc) via uuidTcc → uuid_tcc
- belongsTo(Professor) via uuidProfessor → uuid_professor
- hasMany(AgendaParticipante) via uuidAgenda → uuid_agenda

---

### AgendaParticipante

- uuidAgendaParticipante: string
- uuidAgenda: string
- uuidUsuario: string
- cargo?: string
- createdAt: DateTime
- updatedAt: DateTime | null

Relações:

- belongsTo(Agenda) via uuidAgenda → uuid_agenda
- belongsTo(Usuario) via uuidUsuario → uuid_usuario
