package com.jadventure.backend.mapper;

import org.mapstruct.BeforeMapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.TargetType;

import java.util.IdentityHashMap;
import java.util.Map;

public class AdventureCopyContext {

    private final Map<Object, Object> copies = new IdentityHashMap<>();

    @BeforeMapping
    @SuppressWarnings("unchecked")
    public <T> T getExistingCopy(Object source, @TargetType Class<T> targetType) {
        return (T) copies.get(source);
    }

    @BeforeMapping
    public void registerCopy(Object source, @MappingTarget Object target) {
        copies.put(source, target);
    }
}
