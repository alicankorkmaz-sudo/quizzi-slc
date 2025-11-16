#!/bin/bash

# Quizzi Authentication System Test Script
# Tests all auth endpoints with curl

set -e

API_BASE="http://localhost:3000/api"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Quizzi Auth System Test ===${NC}\n"

# Test 1: Create anonymous user
echo -e "${YELLOW}1. Creating anonymous user...${NC}"
ANON_RESPONSE=$(curl -s -X POST "$API_BASE/auth/anonymous")
echo "$ANON_RESPONSE" | jq .

USER_ID=$(echo "$ANON_RESPONSE" | jq -r '.data.userId')
AUTH_TOKEN=$(echo "$ANON_RESPONSE" | jq -r '.data.authToken')
USERNAME=$(echo "$ANON_RESPONSE" | jq -r '.data.username')
IS_ANON=$(echo "$ANON_RESPONSE" | jq -r '.data.isAnonymous')

if [ "$IS_ANON" == "true" ] && [ -n "$AUTH_TOKEN" ]; then
    echo -e "${GREEN}✓ Anonymous user created: $USERNAME${NC}\n"
else
    echo -e "${RED}✗ Failed to create anonymous user${NC}\n"
    exit 1
fi

# Test 2: Validate token
echo -e "${YELLOW}2. Validating auth token...${NC}"
VALIDATE_RESPONSE=$(curl -s -X GET "$API_BASE/auth/validate" \
    -H "Authorization: Bearer $AUTH_TOKEN")
echo "$VALIDATE_RESPONSE" | jq .

VALID=$(echo "$VALIDATE_RESPONSE" | jq -r '.success')
if [ "$VALID" == "true" ]; then
    echo -e "${GREEN}✓ Token is valid${NC}\n"
else
    echo -e "${RED}✗ Token validation failed${NC}\n"
    exit 1
fi

# Test 3: Register custom username
CUSTOM_USERNAME="test_player_$(date +%s)"
echo -e "${YELLOW}3. Registering custom username: $CUSTOM_USERNAME...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"userId\": \"$USER_ID\", \"username\": \"$CUSTOM_USERNAME\"}")
echo "$REGISTER_RESPONSE" | jq .

NEW_USERNAME=$(echo "$REGISTER_RESPONSE" | jq -r '.data.username')
IS_ANON_AFTER=$(echo "$REGISTER_RESPONSE" | jq -r '.data.isAnonymous')

if [ "$NEW_USERNAME" == "$CUSTOM_USERNAME" ] && [ "$IS_ANON_AFTER" == "false" ]; then
    echo -e "${GREEN}✓ Username registered successfully${NC}\n"
else
    echo -e "${RED}✗ Username registration failed${NC}\n"
    exit 1
fi

# Test 4: Try to register duplicate username (should fail)
echo -e "${YELLOW}4. Testing duplicate username (should fail)...${NC}"
DUPLICATE_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"userId\": \"$USER_ID\", \"username\": \"$CUSTOM_USERNAME\"}")
echo "$DUPLICATE_RESPONSE" | jq .

DUPLICATE_ERROR=$(echo "$DUPLICATE_RESPONSE" | jq -r '.error')
if [[ "$DUPLICATE_ERROR" == *"already has a registered username"* ]]; then
    echo -e "${GREEN}✓ Correctly rejected duplicate registration${NC}\n"
else
    echo -e "${RED}✗ Should have rejected duplicate registration${NC}\n"
fi

# Test 5: Validate token after registration
echo -e "${YELLOW}5. Re-validating token after registration...${NC}"
VALIDATE2_RESPONSE=$(curl -s -X GET "$API_BASE/auth/validate" \
    -H "Authorization: Bearer $AUTH_TOKEN")
echo "$VALIDATE2_RESPONSE" | jq .

VALIDATED_USERNAME=$(echo "$VALIDATE2_RESPONSE" | jq -r '.data.username')
if [ "$VALIDATED_USERNAME" == "$CUSTOM_USERNAME" ]; then
    echo -e "${GREEN}✓ Token still valid with updated username${NC}\n"
else
    echo -e "${RED}✗ Token validation failed after registration${NC}\n"
    exit 1
fi

# Test 6: Invalid token
echo -e "${YELLOW}6. Testing invalid token (should fail)...${NC}"
INVALID_RESPONSE=$(curl -s -X GET "$API_BASE/auth/validate" \
    -H "Authorization: Bearer invalid.token.here")
echo "$INVALID_RESPONSE" | jq .

INVALID_ERROR=$(echo "$INVALID_RESPONSE" | jq -r '.error')
if [[ "$INVALID_ERROR" == *"Invalid"* ]]; then
    echo -e "${GREEN}✓ Correctly rejected invalid token${NC}\n"
else
    echo -e "${RED}✗ Should have rejected invalid token${NC}\n"
fi

# Test 7: Logout
echo -e "${YELLOW}7. Logging out user...${NC}"
LOGOUT_RESPONSE=$(curl -s -X POST "$API_BASE/auth/logout" \
    -H "Content-Type: application/json" \
    -d "{\"userId\": \"$USER_ID\"}")
echo "$LOGOUT_RESPONSE" | jq .

LOGOUT_SUCCESS=$(echo "$LOGOUT_RESPONSE" | jq -r '.success')
if [ "$LOGOUT_SUCCESS" == "true" ]; then
    echo -e "${GREEN}✓ User logged out successfully${NC}\n"
else
    echo -e "${RED}✗ Logout failed${NC}\n"
    exit 1
fi

# Test 8: Validate token after logout (should fail)
echo -e "${YELLOW}8. Testing token after logout (should fail)...${NC}"
VALIDATE3_RESPONSE=$(curl -s -X GET "$API_BASE/auth/validate" \
    -H "Authorization: Bearer $AUTH_TOKEN")
echo "$VALIDATE3_RESPONSE" | jq .

AFTER_LOGOUT_ERROR=$(echo "$VALIDATE3_RESPONSE" | jq -r '.error')
if [[ "$AFTER_LOGOUT_ERROR" == *"Invalid"* ]]; then
    echo -e "${GREEN}✓ Token correctly invalidated after logout${NC}\n"
else
    echo -e "${RED}✗ Token should be invalid after logout${NC}\n"
    exit 1
fi

echo -e "${GREEN}=== All tests passed! ===${NC}"
