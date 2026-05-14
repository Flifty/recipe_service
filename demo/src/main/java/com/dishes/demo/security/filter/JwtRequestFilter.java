package com.dishes.demo.security.filter;

import com.dishes.demo.model.constants.ApiErrorMessage;
import com.dishes.demo.security.JwtTokenProvider;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtRequestFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String LOGIN_PATH = "/auth/login";
    private static final String REGISTER_PATH = "/auth/register";

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(
            @NotNull HttpServletRequest request,
            @NotNull HttpServletResponse response,
            @NotNull FilterChain filterChain
    ) throws ServletException, IOException {

        Optional<String> authHeader = Optional.ofNullable(request.getHeader(AUTHORIZATION_HEADER));
        String requestURI = request.getRequestURI();

        if (authHeader.isPresent() && authHeader.get().startsWith(BEARER_PREFIX)) {
            String jwt = authHeader.get().substring(BEARER_PREFIX.length());

            try {
                if (!jwtTokenProvider.validateToken(jwt)) {
                    throw new ExpiredJwtException(null, null, ApiErrorMessage.TOKEN_EXPIRED.getMessage());
                }

                Optional<String> emailOpt = Optional.ofNullable(jwtTokenProvider.getEmail(jwt));

                if (emailOpt.isPresent() && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(
                                    emailOpt.get(),
                                    jwt,
                                    Collections.emptyList()
                            );

                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                }

            } catch (ExpiredJwtException e) {
                handleTokenExpiration(requestURI, jwt, response);
                return;
            } catch (SignatureException | MalformedJwtException e) {
                handleSignatureException(response);
                return;
            } catch (Exception e) {
                handleUnexpectedException(response, e);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private void handleTokenExpiration(String requestURI, String jwt, HttpServletResponse response) throws IOException {
        if (isAuthEndpoint(requestURI)) {
            String refreshedToken = jwtTokenProvider.refreshToken(jwt);
            response.setHeader(AUTHORIZATION_HEADER, BEARER_PREFIX + refreshedToken);
        } else {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, ApiErrorMessage.TOKEN_EXPIRED.getMessage());
        }
    }

    private void handleSignatureException(HttpServletResponse response) throws IOException {
        sendErrorResponse(response, HttpStatus.UNAUTHORIZED, ApiErrorMessage.INVALID_TOKEN_SIGNATURE.getMessage());
    }

    private void handleUnexpectedException(HttpServletResponse response, Exception e) throws IOException {
        log.error(ApiErrorMessage.ERROR_DURING_JWT_PROCESSING.getMessage(), e);
        sendErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, ApiErrorMessage.UNEXPECTED_ERROR_OCCURRED.getMessage());
    }

    private void sendErrorResponse(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.getWriter().write(message);
    }

    private boolean isAuthEndpoint(String uri) {
        return uri.equals(LOGIN_PATH) || uri.equals(REGISTER_PATH);
    }
}