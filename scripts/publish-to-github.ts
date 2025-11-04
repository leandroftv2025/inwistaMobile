import { getUncachableGitHubClient } from '../server/github';
import { execSync } from 'child_process';

async function publishToGitHub() {
  try {
    console.log('🔐 Conectando ao GitHub...');
    const octokit = await getUncachableGitHubClient();

    // Get authenticated user
    const { data: user } = await octokit.users.getAuthenticated();
    console.log(`✅ Autenticado como: ${user.login}`);

    const repoName = 'inwistaMobile';
    const isPrivate = false;

    console.log(`📦 Criando repositório "${repoName}"...`);
    
    try {
      // Create repository
      const { data: repo } = await octokit.repos.createForAuthenticatedUser({
        name: repoName,
        description: 'Inwista Fintech MVP - Aplicação financeira completa com PIX, StableCOIN e Investimentos',
        private: isPrivate,
        auto_init: false,
      });

      console.log(`✅ Repositório criado: ${repo.html_url}`);

      // Configure git remote
      const remoteUrl = `https://github.com/${user.login}/${repoName}.git`;
      
      console.log('🔧 Configurando remote do git...');
      try {
        execSync('git remote remove origin', { stdio: 'ignore' });
      } catch (e) {
        // Remote doesn't exist, that's fine
      }
      
      execSync(`git remote add origin ${remoteUrl}`);
      console.log('✅ Remote configurado');

      console.log('📤 Fazendo push para o GitHub...');
      console.log('⚠️  Nota: Você precisará executar o push manualmente com:');
      console.log(`   git push -u origin main`);
      console.log(`\n🌐 Repositório: ${repo.html_url}`);

      return repo;
    } catch (error: any) {
      if (error.status === 422 && error.message.includes('already exists')) {
        console.log(`⚠️  Repositório "${repoName}" já existe`);
        const remoteUrl = `https://github.com/${user.login}/${repoName}.git`;
        
        console.log('🔧 Configurando remote do git...');
        try {
          execSync('git remote remove origin', { stdio: 'ignore' });
        } catch (e) {
          // Remote doesn't exist, that's fine
        }
        
        execSync(`git remote add origin ${remoteUrl}`);
        console.log('✅ Remote configurado');
        console.log('⚠️  Execute manualmente: git push -u origin main');
        console.log(`🌐 Repositório: https://github.com/${user.login}/${repoName}`);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  }
}

publishToGitHub();
