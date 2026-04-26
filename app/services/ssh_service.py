import logging
import time
from typing import Optional
from netmiko import ConnectHandler, NetmikoTimeoutException, NetmikoAuthenticationException

# Configuração básica de log para este módulo
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class HuaweiSSHService:
    def __init__(self, host: str, username: str, password: str, port: int = 22, timeout: int = 15, retries: int = 3):
        self.device = {
            "device_type": "huawei",
            "host": host,
            "username": username,
            "password": password,
            "port": port,
            "timeout": timeout,
            "global_delay_factor": 2, # Útil para equipamentos que respondem mais devagar
        }
        self.retries = retries

    def _execute_command(self, command: str) -> Optional[str]:
        """
        Executa um comando no equipamento via SSH utilizando Netmiko com lógica de retry simples.
        """
        for attempt in range(1, self.retries + 1):
            try:
                logger.info(f"Tentativa {attempt}/{self.retries} - Conectando em {self.device['host']} para executar '{command}'")
                with ConnectHandler(**self.device) as ssh:
                    # read_timeout extra caso o comando seja muito custoso e demore pra retornar
                    output = ssh.send_command(command, read_timeout=self.device["timeout"])
                    logger.info(f"Comando executado com sucesso em {self.device['host']}")
                    return output
                    
            except NetmikoAuthenticationException:
                logger.error(f"Falha de autenticação no dispositivo {self.device['host']}")
                raise ValueError("Credenciais SSH inválidas")
                
            except (NetmikoTimeoutException, Exception) as e:
                logger.warning(f"Tentativa {attempt} falhou no dispositivo {self.device['host']}: {str(e)}")
                if attempt == self.retries:
                    logger.error(f"Todas as {self.retries} tentativas falharam para {self.device['host']}.")
                    raise ConnectionError(f"Não foi possível executar comando no dispositivo: {str(e)}")
                time.sleep(2) # Pausa básica antes de tentar novamente
                
        return None

    def get_running_config(self) -> str:
        """
        Obtém a configuração atual do equipamento (running-config).
        Comando VRP: display current-configuration
        """
        output = self._execute_command("display current-configuration")
        return output if output else ""

    def display_interface_brief(self) -> str:
        """
        Obtém o resumo das interfaces físicas e lógicas (status físico/protocolo).
        Comando VRP: display interface brief
        """
        output = self._execute_command("display interface brief")
        return output if output else ""

    def display_ip_interface_brief(self) -> str:
        """
        Obtém o resumo dos IPs atribuídos às interfaces e seu status.
        Comando VRP: display ip interface brief
        """
        output = self._execute_command("display ip interface brief")
        return output if output else ""
