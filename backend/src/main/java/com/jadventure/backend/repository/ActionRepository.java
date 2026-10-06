package com.jadventure.backend.repository;

import com.jadventure.backend.model.Action;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActionRepository extends JpaRepository<Action, Long> {

    Optional<Action> findByCode(String code);

    boolean existsByCode(String code);

    List<Action> findAllByItemCode(String itemCode);

    Optional<Action> findByItemCodeAndCode(String itemCode, String code);
}
