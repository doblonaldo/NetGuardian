from typing import Dict, Any
import asyncio
from app.collectors.base import BaseCollector
from app.services.ssh_service import HuaweiSSHService

class HuaweiCollector(BaseCollector):
    def __init__(self, host: str, credentials: dict = None):
        super().__init__(host, credentials)
        # O serviço SSH precisa de credenciais, tentamos extrair do dict ou usar defaults propostos
        username = self.credentials.get("username", "admin")
        password = self.credentials.get("password", "")
        port = self.credentials.get("port", 22)
        
        # Instancia o serviço que cuida da abstração com o netmiko
        self.ssh_client = HuaweiSSHService(
            host=self.host,
            username=username,
            password=password,
            port=port
        )

    async def connect(self):
        # O HuaweiSSHService atual usa context manager (with ConnectHandler) na execução de cada comando.
        # Portanto, a conexão SSH é gerenciada sob demanda na própria coleta e não há socket para manter aberto aqui.
        pass

    async def collect_facts(self) -> Dict[str, str]:
        """
        Coleta informações do equipamento Huawei acionando o HuaweiSSHService.
        O netmiko é bloqueante (síncrono), então envelopamos em run_in_executor para não travar o event loop do FastAPI.
        """
        loop = asyncio.get_running_loop()
        
        # Coletamos os 3 pontos de dados de forma delegada a threads para não congelar outras requisições da API
        config = await loop.run_in_executor(None, self.ssh_client.get_running_config)
        interfaces = await loop.run_in_executor(None, self.ssh_client.display_interface_brief)
        ip_interfaces = await loop.run_in_executor(None, self.ssh_client.display_ip_interface_brief)

        return {
            "config": config,
            "interfaces": interfaces,
            "ip_interfaces": ip_interfaces
        }

    async def disconnect(self):
        # A sessão é fechada nativamente pelo context manager with ConnectHandler dentro do SSHService
        pass
