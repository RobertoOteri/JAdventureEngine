package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.EffectType;
import com.jadventure.backend.service.LeaderboardService;
import org.springframework.stereotype.Component;

@Component
public class EndAdventureEffectHandler implements EffectHandler {

    private final LeaderboardService leaderboardService;

    public EndAdventureEffectHandler(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @Override
    public EffectType type() {
        return EffectType.END_ADVENTURE;
    }

    @Override
    public void apply(String adventureCode, GameStateDto state, GameEffectDto effect) {
        state.setCompleted(true);
        leaderboardService.createLeaderboardEntry(adventureCode, state.getPlayTime());
    }
}