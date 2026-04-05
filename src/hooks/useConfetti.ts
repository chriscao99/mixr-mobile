import React, { useCallback, useRef } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  SharedValue,
  makeMutable,
} from 'react-native-reanimated';
import { colors } from '../theme';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const CONFETTI_COLORS = [
  colors.accentPrimary,
  colors.accentSecondary,
  colors.accentTertiary,
  colors.amber,
  colors.pink,
  colors.red,
];

interface Particle {
  translateY: SharedValue<number>;
  translateX: SharedValue<number>;
  rotation: SharedValue<number>;
  opacity: SharedValue<number>;
  color: string;
  size: number;
  startX: number;
}

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    translateY: makeMutable(0),
    translateX: makeMutable(0),
    rotation: makeMutable(0),
    opacity: makeMutable(0),
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 8,
    startX: Math.random() * SCREEN_WIDTH,
  }));
}

/**
 * Animation Spec #10: Achievement Confetti
 * Generates N particles with random positions, rotations, and colors.
 * Each particle animates downward, spins, and fades out.
 */
export function useConfetti(particleCount = 24) {
  const particlesRef = useRef<Particle[] | null>(null);
  if (particlesRef.current === null) {
    particlesRef.current = createParticles(particleCount);
  }
  const particles = particlesRef.current;

  const trigger = useCallback(() => {
    particles.forEach((p) => {
      const delay = Math.random() * 300;
      const duration = 1800 + Math.random() * 1200;
      const drift = (Math.random() - 0.5) * 160;

      // Reset positions
      p.translateY.value = -20;
      p.translateX.value = 0;
      p.rotation.value = 0;
      p.opacity.value = 0;

      // Randomize horizontal start for each burst
      p.startX = Math.random() * SCREEN_WIDTH;

      // Fade in then out
      p.opacity.value = withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 100 }),
          withDelay(
            duration * 0.6,
            withTiming(0, { duration: duration * 0.4 }),
          ),
        ),
      );

      // Fall downward
      p.translateY.value = withDelay(
        delay,
        withTiming(SCREEN_HEIGHT + 40, {
          duration,
          easing: Easing.in(Easing.quad),
        }),
      );

      // Horizontal drift
      p.translateX.value = withDelay(
        delay,
        withTiming(drift, {
          duration,
          easing: Easing.out(Easing.ease),
        }),
      );

      // Spin
      p.rotation.value = withDelay(
        delay,
        withTiming(
          (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720),
          { duration, easing: Easing.linear },
        ),
      );
    });
  }, [particles]);

  const ParticleView: React.FC = useCallback(
    () =>
      React.createElement(
        Animated.View,
        { style: StyleSheet.absoluteFill, pointerEvents: 'none' as const },
        particles.map((p, i) =>
          React.createElement(ConfettiPiece, { key: i, particle: p }),
        ),
      ),
    [particles],
  );

  return { particles, trigger, ParticleView };
}

interface ConfettiPieceProps {
  particle: Particle;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = React.memo(
  ({ particle }) => {
    const style = useAnimatedStyle(() => ({
      position: 'absolute' as const,
      left: particle.startX,
      top: 0,
      width: particle.size,
      height: particle.size * 1.4,
      borderRadius: 2,
      backgroundColor: particle.color,
      opacity: particle.opacity.value,
      transform: [
        { translateY: particle.translateY.value },
        { translateX: particle.translateX.value },
        { rotate: `${particle.rotation.value}deg` },
      ],
    }));

    return React.createElement(Animated.View, { style });
  },
);
