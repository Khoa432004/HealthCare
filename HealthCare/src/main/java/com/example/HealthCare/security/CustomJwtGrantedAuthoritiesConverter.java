package com.example.HealthCare.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

@SuppressWarnings("unchecked")
public class CustomJwtGrantedAuthoritiesConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        List<GrantedAuthority> authorities = new ArrayList<>();

        Object rolesObj = jwt.getClaims().get("roles");
        if (rolesObj instanceof List<?> roles) {
            for (Object role : roles) {
                if (role instanceof String roleName && !roleName.isBlank()) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + roleName));
                }
            }
        }

        Object privilegesObj = jwt.getClaims().get("privileges");
        if (privilegesObj instanceof List<?> privileges) {
            for (Object p : privileges) {
                if (p instanceof String priv && !priv.isBlank()) {
                    authorities.add(new SimpleGrantedAuthority(priv));
                }
            }
        }

        return authorities;
    }
}


