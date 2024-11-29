import logging as log
import os
import sys

from pydantic_settings import BaseSettings, SettingsConfigDict

fl = sys.argv[0]
pathname = os.path.dirname(fl)
dir_path = os.path.abspath(pathname)
timestamps = {}
PROFILE_ENVIRON = "PROFILE"
DEFAULT_PROFILE = "local"


def set_log_level(logger):
    logger = log.getLogger(logger)
    logger.setLevel(log.DEBUG)


def init_log(app_name: str = "app"):

    set_log_level(app_name)

    log.basicConfig(
        format="%(levelname)s: %(asctime)s,%(msecs)d [%(filename)s:%(lineno)d] %(message)s",
        datefmt="%Y-%m-%d:%H:%M:%S",
        level=log.INFO,
    )


def join_with_root(path):
    return os.path.join(dir_path, path)


def get_profile():
    p = DEFAULT_PROFILE
    if PROFILE_ENVIRON in os.environ:
        p = os.environ[PROFILE_ENVIRON]
    return p


def get_config():
    profile = get_profile()
    env_file = join_with_root(f"{profile}.cfg")
    return Settings(_env_file=env_file)


class Lazy:
    """Abstract data that will be initialized when it is actually accessed."""

    def __init__(self):
        self._inits = {}

    def add_initializer(self, name, initializer):
        """Adds the initializer function to the specified property."""
        self._inits[name] = initializer

    def has_attr(self, name):
        try:
            object.__getattribute__(self, name)
            return True
        except:
            return False

    def __getattr__(self, name):
        try:
            return object.__getattribute__(self, name)
        except:
            initializer = self._inits[name]
            log.debug("value (%s) initialized", name)
            value = initializer()
            object.__setattr__(self, name, value)
            return value

    def __delattr__(self, name):
        return object.__delattr__(self, name)

    def __setattr__(self, name, value):
        return object.__setattr__(self, name, value)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file_encoding="utf-8", extra="allow")
