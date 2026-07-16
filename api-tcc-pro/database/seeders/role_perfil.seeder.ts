import Perfil from '#models/DAO/perfil'
import PerfilRole from '#models/DAO/perfil_role'
import Role from '#models/DAO/role'

type RoleSeed = {
  codRole: string
  desRole: string
}

type PerfilSeed = {
  nomePerfil: string
  roles: string[]
}

type SeedData = {
  roles: RoleSeed[]
  perfis: PerfilSeed[]
}

const seedData: SeedData = {
  roles: [
    { codRole: 'ROLE_ROLE_EDIT', desRole: 'Permite editar roles' },
    { codRole: 'ROLE_ROLE_VIEW', desRole: 'Permite visualizar roles' },
    { codRole: 'ROLE_PERFIL_EDIT', desRole: 'Permite editar perfis' },
    { codRole: 'ROLE_PERFIL_VIEW', desRole: 'Permite visualizar perfis' },
    { codRole: 'ROLE_USUARIO_EDIT', desRole: 'Permite editar usuários' },
    { codRole: 'ROLE_USUARIO_VIEW', desRole: 'Permite visualizar usuários' },
    { codRole: 'ROLE_ALUNO_EDIT', desRole: 'Permite editar alunos' },
    { codRole: 'ROLE_ALUNO_VIEW', desRole: 'Permite visualizar alunos' },
    { codRole: 'ROLE_TEMA_VIEW', desRole: 'Permite visualizar temas' },
    { codRole: 'ROLE_TEMA_EDIT', desRole: 'Permite editar temas' },
    { codRole: 'ROLE_TCC_VIEW', desRole: 'Permite visualizar TCCs' },
    { codRole: 'ROLE_TCC_EDIT', desRole: 'Permite editar TCCs' },
    { codRole: 'ROLE_AGENDA_VIEW', desRole: 'Permite visualizar agendas' },
    { codRole: 'ROLE_AGENDA_EDIT', desRole: 'Permite editar agendas' },
    { codRole: 'ROLE_PROFESSOR_VIEW', desRole: 'Permite visualizar professores' },
    { codRole: 'ROLE_PROFESSOR_EDIT', desRole: 'Permite editar professores' },
    { codRole: 'ROLE_MENU_ADM', desRole: 'Permite acessar o menu de administração' },
    { codRole: 'ROLE_DASH_ALUNO', desRole: 'Permite acessar o dashboard do aluno' },
    { codRole: 'ROLE_DASH_PROFESSOR', desRole: 'Permite acessar o dashboard do professor' },
    { codRole: 'ROLE_DASH_COORDENADOR', desRole: 'Permite acessar o dashboard do coordenador' },
    { codRole: 'ROLE_MENU_MEU_TCC', desRole: 'Permite acessar o menu Meu TCC' },
    { codRole: 'ROLE_MENU_AGENDA', desRole: 'Permite acessar o menu Agenda' },
  ],
  perfis: [
    {
      nomePerfil: 'Administrador',
      roles: [
        'ROLE_ROLE_EDIT',
        'ROLE_ROLE_VIEW',
        'ROLE_PERFIL_EDIT',
        'ROLE_PERFIL_VIEW',
        'ROLE_USUARIO_EDIT',
        'ROLE_USUARIO_VIEW',
        'ROLE_ALUNO_EDIT',
        'ROLE_ALUNO_VIEW',
        'ROLE_TEMA_VIEW',
        'ROLE_TEMA_EDIT',
        'ROLE_TCC_VIEW',
        'ROLE_TCC_EDIT',
        'ROLE_AGENDA_VIEW',
        'ROLE_AGENDA_EDIT',
        'ROLE_PROFESSOR_VIEW',
        'ROLE_PROFESSOR_EDIT',
        'ROLE_MENU_ADM',
        'ROLE_DASH_ALUNO',
        'ROLE_DASH_PROFESSOR',
        'ROLE_DASH_COORDENADOR',
        'ROLE_MENU_MEU_TCC',
        'ROLE_MENU_AGENDA',
      ],
    },
    {
      nomePerfil: 'Aluno',
      roles: [
        'ROLE_TEMA_VIEW',
        'ROLE_TEMA_EDIT',
        'ROLE_TCC_VIEW',
        'ROLE_TCC_EDIT',
        'ROLE_AGENDA_VIEW',
        'ROLE_AGENDA_EDIT',
        'ROLE_DASH_ALUNO',
        'ROLE_MENU_MEU_TCC',
        'ROLE_MENU_AGENDA',
      ],
    },
    {
      nomePerfil: 'Professor',
      roles: ['ROLE_TCC_VIEW', 'ROLE_AGENDA_VIEW', 'ROLE_DASH_PROFESSOR', 'ROLE_MENU_AGENDA'],
    },
    {
      nomePerfil: 'Coordenador',
      roles: [
        'ROLE_ALUNO_VIEW',
        'ROLE_TEMA_VIEW',
        'ROLE_TEMA_EDIT',
        'ROLE_TCC_VIEW',
        'ROLE_TCC_EDIT',
        'ROLE_AGENDA_VIEW',
        'ROLE_AGENDA_EDIT',
        'ROLE_PROFESSOR_VIEW',
        'ROLE_DASH_COORDENADOR',
        'ROLE_MENU_AGENDA',
      ],
    },
  ],
}

export default class RolePerfilSeeder {
  async run() {
    const roleDefinitions = seedData.roles
    const perfilDefinitions = seedData.perfis

    const roleCodes = roleDefinitions.map((role) => role.codRole)
    const existingRoles = await Role.query().whereIn('codRole', roleCodes)

    const rolesMap = new Map(existingRoles.map((role) => [role.codRole, role]))

    for (const roleDef of roleDefinitions) {
      if (!rolesMap.has(roleDef.codRole)) {
        const createdRole = await Role.create(roleDef)
        rolesMap.set(createdRole.codRole, createdRole)
      }
    }

    for (const perfilDef of perfilDefinitions) {
      let perfil = await Perfil.query().where('nomePerfil', perfilDef.nomePerfil).first()
      if (!perfil) {
        perfil = await Perfil.create({ nomePerfil: perfilDef.nomePerfil })
      }

      const roleUuids = perfilDef.roles.map((roleName) => {
        const role = rolesMap.get(roleName)
        if (!role) {
          throw new Error(`Role "${roleName}" not found for perfil "${perfilDef.nomePerfil}"`)
        }
        return role.uuidRole
      })

      const existingAssignments = await PerfilRole.query().where('uuidPerfil', perfil.uuidPerfil)

      const assignmentKeys = new Set(
        existingAssignments.map((assignment) => `${assignment.uuidPerfil}:${assignment.uuidRole}`)
      )

      if (perfilDef.nomePerfil === 'Professor') {
        const allowedRoleUuids = new Set(roleUuids)
        const assignmentsToRemove = existingAssignments.filter(
          (assignment) => !allowedRoleUuids.has(assignment.uuidRole)
        )

        for (const assignment of assignmentsToRemove) {
          await assignment.delete()
        }
      }

      for (const uuidRole of roleUuids) {
        const key = `${perfil.uuidPerfil}:${uuidRole}`
        if (!assignmentKeys.has(key)) {
          await PerfilRole.create({ uuidPerfil: perfil.uuidPerfil, uuidRole })
        }
      }
    }
  }
}
