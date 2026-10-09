DO $$
DECLARE
    -- 👈 1. اسم الجدول المستهدف
    target_table  text := 'notification_channels';

    -- 👈 2. الصلاحيات الثلاث لكل عملية
    perm_insert   text := 'create_notification_channel';
    perm_update   text := 'update_notification_channel';
    perm_delete   text := 'delete_notification_channel';

    pol RECORD;
BEGIN
    -- 1. تفعيل RLS على الجدول
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', target_table);

    -- 2. إزالة أي سياسات سابقة على هذا الجدول
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = target_table 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', pol.policyname, target_table);
    END LOOP;

    -- 3. سياسة SELECT (متاحة للجميع public)
    EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR SELECT TO public USING (true);',
        target_table || '_select_policy',
        target_table
    );

    -- 4. سياسة INSERT
    EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (has_permission(%L::text));',
        target_table || '_insert_policy',
        target_table,
        perm_insert
    );

    -- 5. سياسة UPDATE
    EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (has_permission(%L::text)) WITH CHECK (has_permission(%L::text));',
        target_table || '_update_policy',
        target_table,
        perm_update,
        perm_update
    );

    -- 6. سياسة DELETE
    EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (has_permission(%L::text));',
        target_table || '_delete_policy',
        target_table,
        perm_delete
    );

    RAISE NOTICE 'Policies created for %: insert(%), update(%), delete(%)', target_table, perm_insert, perm_update, perm_delete;
END $$;