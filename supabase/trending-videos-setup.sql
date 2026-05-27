-- trending_videos 테이블
-- 카테고리별 YouTube 급상승 영상 데이터를 저장
-- GitHub Actions가 매일 KST 00:00(UTC 15:00)에 upsert

create table if not exists trending_videos (
  id         text        primary key,              -- 카테고리 라벨 (e.g. "뷰티/패션")
  category   text        not null,                 -- 카테고리 한글명
  label_en   text        not null default '',      -- 카테고리 영문명
  emoji      text        not null default '',      -- 카테고리 이모지
  videos     jsonb       not null default '[]',    -- CategoryVideo[] 배열
  updated_at timestamptz not null default now()    -- 마지막 업데이트 시각
);

comment on table trending_videos is
  'YouTube 카테고리별 급상승 영상 캐시 (GitHub Actions 매일 갱신)';
comment on column trending_videos.id       is '카테고리 한글 라벨 (PK)';
comment on column trending_videos.videos   is 'CategoryVideo[] JSON 배열';
comment on column trending_videos.updated_at is 'GitHub Actions upsert 시각';

-- Row Level Security
alter table trending_videos enable row level security;

-- 누구나 읽기 가능
create policy "trending_videos_public_read"
  on trending_videos for select
  using (true);

-- service_role 만 쓰기 가능 (GitHub Actions)
create policy "trending_videos_service_write"
  on trending_videos for all
  using (auth.role() = 'service_role');
