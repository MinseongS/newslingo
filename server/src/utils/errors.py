import logging as log

from fastapi import HTTPException


class NotFoundException(HTTPException):
    def __init__(self, desc="Resource Not Found"):
        super().__init__(404)
        self.detail = desc
        log.error(desc)


class BadRequestException(HTTPException):
    def __init__(self, desc="Bad Request"):
        super().__init__(400)
        self.detail = desc
        log.error(desc)


class InternalServerException(HTTPException):
    def __init__(self, desc="Internal Server Error"):
        super().__init__(500)
        self.detail = desc
        log.error(desc)


class InvalidAuthentication(HTTPException):
    def __init__(self, desc="Invalid Authentication"):
        super().__init__(401)
        self.detail = desc
        log.error(desc)


class ContentTooLongException(HTTPException):
    def __init__(self, desc="Content Too Long"):
        super().__init__(413)
        self.detail = desc
        log.error(desc)
