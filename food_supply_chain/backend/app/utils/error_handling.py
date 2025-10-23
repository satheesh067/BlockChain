import logging
from typing import Dict, Any, Optional
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import traceback
import sys
from datetime import datetime

# Configure logging
logger = logging.getLogger(__name__)

class ErrorHandler:
    """Centralized error handling for the application"""
    
    def __init__(self):
        self.error_counts = {}
        self.error_threshold = 10  # Alert after 10 similar errors
    
    def log_error(self, error: Exception, context: Dict[str, Any] = None):
        """Log error with context information"""
        error_type = type(error).__name__
        error_message = str(error)
        
        # Count error occurrences
        error_key = f"{error_type}:{error_message}"
        self.error_counts[error_key] = self.error_counts.get(error_key, 0) + 1
        
        # Log error details
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "error_type": error_type,
            "error_message": error_message,
            "context": context or {},
            "count": self.error_counts[error_key],
            "traceback": traceback.format_exc()
        }
        
        logger.error(f"Error occurred: {log_data}")
        
        # Alert if error threshold exceeded
        if self.error_counts[error_key] >= self.error_threshold:
            logger.critical(f"Error threshold exceeded for {error_key}: {self.error_counts[error_key]} occurrences")
    
    def handle_validation_error(self, error: RequestValidationError) -> JSONResponse:
        """Handle FastAPI validation errors"""
        errors = []
        for err in error.errors():
            field = " -> ".join(str(loc) for loc in err["loc"])
            message = err["msg"]
            errors.append({
                "field": field,
                "message": message,
                "type": err["type"]
            })
        
        self.log_error(error, {"validation_errors": errors})
        
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "error": "Validation Error",
                "message": "Invalid input data",
                "details": errors
            }
        )
    
    def handle_http_exception(self, error: StarletteHTTPException) -> JSONResponse:
        """Handle HTTP exceptions"""
        self.log_error(error, {"status_code": error.status_code})
        
        return JSONResponse(
            status_code=error.status_code,
            content={
                "success": False,
                "error": "HTTP Error",
                "message": error.detail,
                "status_code": error.status_code
            }
        )
    
    def handle_generic_exception(self, error: Exception) -> JSONResponse:
        """Handle generic exceptions"""
        self.log_error(error)
        
        # Don't expose internal errors in production
        if sys.gettrace() is None:  # Production mode
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": "Internal Server Error",
                    "message": "An unexpected error occurred. Please try again later."
                }
            )
        else:  # Development mode
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": "Internal Server Error",
                    "message": str(error),
                    "traceback": traceback.format_exc()
                }
            )
    
    def create_custom_error(self, message: str, status_code: int = 400, details: Dict = None) -> HTTPException:
        """Create a custom HTTP exception"""
        error_data = {
            "success": False,
            "error": "Custom Error",
            "message": message
        }
        
        if details:
            error_data["details"] = details
        
        return HTTPException(status_code=status_code, detail=error_data)

# Global error handler instance
error_handler = ErrorHandler()

# Custom exception classes
class ValidationError(Exception):
    """Custom validation error"""
    def __init__(self, message: str, field: str = None, code: str = None):
        self.message = message
        self.field = field
        self.code = code
        super().__init__(message)

class BusinessLogicError(Exception):
    """Custom business logic error"""
    def __init__(self, message: str, code: str = None):
        self.message = message
        self.code = code
        super().__init__(message)

class BlockchainError(Exception):
    """Custom blockchain-related error"""
    def __init__(self, message: str, transaction_hash: str = None, code: str = None):
        self.message = message
        self.transaction_hash = transaction_hash
        self.code = code
        super().__init__(message)

class IPFSError(Exception):
    """Custom IPFS-related error"""
    def __init__(self, message: str, hash: str = None, code: str = None):
        self.message = message
        self.hash = hash
        self.code = code
        super().__init__(message)

# Validation utilities
class Validator:
    """Input validation utilities"""
    
    @staticmethod
    def validate_ethereum_address(address: str) -> bool:
        """Validate Ethereum address format"""
        if not address or not isinstance(address, str):
            return False
        
        if not address.startswith('0x'):
            return False
        
        if len(address) != 42:
            return False
        
        try:
            int(address[2:], 16)
            return True
        except ValueError:
            return False
    
    @staticmethod
    def validate_coordinates(coords: str) -> bool:
        """Validate GPS coordinates format"""
        if not coords or not isinstance(coords, str):
            return False
        
        try:
            parts = coords.split(',')
            if len(parts) != 2:
                return False
            
            lat = float(parts[0].strip())
            lng = float(parts[1].strip())
            
            return -90 <= lat <= 90 and -180 <= lng <= 180
        except (ValueError, IndexError):
            return False
    
    @staticmethod
    def validate_positive_integer(value: Any) -> bool:
        """Validate positive integer"""
        try:
            num = int(value)
            return num > 0
        except (ValueError, TypeError):
            return False
    
    @staticmethod
    def validate_positive_float(value: Any) -> bool:
        """Validate positive float"""
        try:
            num = float(value)
            return num >= 0
        except (ValueError, TypeError):
            return False
    
    @staticmethod
    def validate_string_length(value: str, min_length: int = 0, max_length: int = None) -> bool:
        """Validate string length"""
        if not isinstance(value, str):
            return False
        
        if len(value) < min_length:
            return False
        
        if max_length is not None and len(value) > max_length:
            return False
        
        return True
    
    @staticmethod
    def validate_file_size(file_size: int, max_size: int) -> bool:
        """Validate file size"""
        return 0 < file_size <= max_size
    
    @staticmethod
    def validate_file_type(filename: str, allowed_extensions: list) -> bool:
        """Validate file type by extension"""
        if not filename:
            return False
        
        extension = filename.lower().split('.')[-1]
        return extension in [ext.lower().lstrip('.') for ext in allowed_extensions]

# Input sanitization utilities
class Sanitizer:
    """Input sanitization utilities"""
    
    @staticmethod
    def sanitize_string(value: str) -> str:
        """Sanitize string input"""
        if not isinstance(value, str):
            return str(value)
        
        # Remove HTML tags
        import re
        value = re.sub(r'<[^>]+>', '', value)
        
        # Remove potentially dangerous characters
        value = value.replace('<', '').replace('>', '')
        
        # Trim whitespace
        return value.strip()
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Sanitize filename"""
        if not filename:
            return ""
        
        # Remove path components
        filename = filename.split('/')[-1].split('\\')[-1]
        
        # Remove dangerous characters
        import re
        filename = re.sub(r'[<>:"/\\|?*]', '', filename)
        
        # Limit length
        if len(filename) > 255:
            name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
            filename = name[:255-len(ext)-1] + ('.' + ext if ext else '')
        
        return filename
    
    @staticmethod
    def sanitize_coordinates(coords: str) -> str:
        """Sanitize coordinates"""
        if not coords:
            return ""
        
        # Remove any non-numeric characters except comma and minus
        import re
        coords = re.sub(r'[^0-9.,-]', '', coords)
        
        return coords.strip()

# Rate limiting utilities
class RateLimiter:
    """Simple rate limiting for API endpoints"""
    
    def __init__(self):
        self.requests = {}
        self.default_limit = 100  # requests per minute
        self.default_window = 60  # seconds
    
    def is_allowed(self, key: str, limit: int = None, window: int = None) -> bool:
        """Check if request is allowed"""
        limit = limit or self.default_limit
        window = window or self.default_window
        
        now = datetime.utcnow().timestamp()
        
        if key not in self.requests:
            self.requests[key] = []
        
        # Remove old requests
        self.requests[key] = [req_time for req_time in self.requests[key] if now - req_time < window]
        
        # Check if under limit
        if len(self.requests[key]) >= limit:
            return False
        
        # Add current request
        self.requests[key].append(now)
        return True
    
    def get_remaining_requests(self, key: str, limit: int = None, window: int = None) -> int:
        """Get remaining requests for the time window"""
        limit = limit or self.default_limit
        window = window or self.default_window
        
        now = datetime.utcnow().timestamp()
        
        if key not in self.requests:
            return limit
        
        # Remove old requests
        self.requests[key] = [req_time for req_time in self.requests[key] if now - req_time < window]
        
        return max(0, limit - len(self.requests[key]))

# Global instances
validator = Validator()
sanitizer = Sanitizer()
rate_limiter = RateLimiter()

# Export commonly used functions
def validate_input(data: Dict[str, Any], rules: Dict[str, Any]) -> Dict[str, Any]:
    """Validate input data against rules"""
    errors = {}
    
    for field, rule in rules.items():
        value = data.get(field)
        
        if rule.get('required', False) and not value:
            errors[field] = f"{field} is required"
            continue
        
        if value and 'validator' in rule:
            if not rule['validator'](value):
                errors[field] = rule.get('message', f"Invalid {field}")
    
    return errors

def sanitize_input_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize input data"""
    sanitized = {}
    
    for key, value in data.items():
        if isinstance(value, str):
            sanitized[key] = sanitizer.sanitize_string(value)
        else:
            sanitized[key] = value
    
    return sanitized

def create_error_response(message: str, status_code: int = 400, details: Dict = None) -> JSONResponse:
    """Create standardized error response"""
    response_data = {
        "success": False,
        "error": "Request Error",
        "message": message
    }
    
    if details:
        response_data["details"] = details
    
    return JSONResponse(status_code=status_code, content=response_data)

def create_success_response(data: Any = None, message: str = "Success") -> JSONResponse:
    """Create standardized success response"""
    response_data = {
        "success": True,
        "message": message
    }
    
    if data is not None:
        response_data["data"] = data
    
    return JSONResponse(status_code=200, content=response_data)
